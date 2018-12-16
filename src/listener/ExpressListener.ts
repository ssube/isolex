import * as express from 'express';
import * as expressGraphQl from 'express-graphql';
import * as http from 'http';
import { isNil } from 'lodash';
import { Container, Inject } from 'noicejs';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from 'passport-jwt';
import { Counter, Registry } from 'prom-client';
import { Connection, Repository } from 'typeorm';

import { ChildServiceOptions } from 'src/ChildService';
import { Token } from 'src/entity/auth/Token';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { GraphSchema, GraphSchemaData } from 'src/graph';
import { ServiceModule } from 'src/module/ServiceModule';
import { ServiceDefinition } from 'src/Service';

import { Listener } from './Listener';
import { SessionListener } from './SessionListener';

export interface ExpressListenerData {
  expose: {
    graph: boolean;
    graphiql: boolean;
    metrics: boolean;
  };
  graph: ServiceDefinition;
  listen: {
    address: string;
    port: number;
  };
  token: {
    audience: string;
    issuer: string;
    scheme: string;
    secret: string;
  };
}

export interface ExpressListenerOptions extends ChildServiceOptions<ExpressListenerData> {
  graph: GraphSchema;
}

@Inject('bot', 'metrics', 'services', 'storage')
export class ExpressListener extends SessionListener<ExpressListenerData> implements Listener {
  protected readonly authenticator: passport.Authenticator;
  protected readonly container: Container;
  protected readonly metrics: Registry;
  protected readonly requestCounter: Counter;
  protected readonly services: ServiceModule;
  protected readonly storage: Connection;
  protected readonly tokenRepository: Repository<Token>;

  protected app: express.Express;
  protected graph?: GraphSchema;
  protected server?: http.Server;

  constructor(options: ExpressListenerOptions) {
    super(options);

    this.authenticator = new passport.Passport();
    this.container = options.container;
    this.metrics = options.metrics;
    this.services = options.services;
    this.storage = options.storage;

    this.requestCounter = new Counter({
      help: 'all requests through this express listener',
      labelNames: ['serviceId', 'serviceKind', 'serviceName', 'requestClient', 'requestHost', 'requestPath'],
      name: 'express_requests',
      registers: [this.metrics],
    });

    this.tokenRepository = this.storage.getRepository(Token);
  }

  public async start() {
    this.app = await this.setupApp();
    this.server = await new Promise<http.Server>((res, rej) => {
      let server: http.Server;
      server = this.app.listen(this.data.listen.port, this.data.listen.address, () => {
        res(server);
      });
    });
  }

  public async stop() {
    if (this.server) {
      this.server.close();
    }

    if (this.graph) {
      await this.graph.stop();
    }
  }

  public async send() {
    this.logger.warn('express listener is not able to emit messages');
  }

  public async fetch(): Promise<Array<Message>> {
    this.logger.warn('express listener is not able to fetch messages');
    return [];
  }

  public getMetrics(req: express.Request, res: express.Response) {
    res.set('Content-Type', this.metrics.contentType);
    res.end(this.metrics.metrics());
  }

  public async traceRequest(req: express.Request, res: express.Response, next: Function) {
    this.logger.debug({ req, res }, 'handling request');
    this.requestCounter.inc({
      requestClient: req.ip,
      requestHost: req.hostname,
      requestPath: req.path,
      serviceId: this.id,
      serviceKind: this.kind,
      serviceName: this.name,
    });
    next();
  }

  protected async createTokenSession(req: express.Request, data: any, done: VerifiedCallback) {
    this.logger.debug({ data, req }, 'finding token for request payload');
    const token = await this.tokenRepository.findOne(data);
    if (isNil(token)) {
      this.logger.warn('token not found');
      return done(undefined, false);
    }

    const ctx = new Context({
      ...data,
      source: this,
      user: token.user,
    });

    const session = token.session(this);
    this.sessions.set(token.id, session);
    this.logger.debug({ session }, 'created session for token');

    done(null, ctx);
  }

  protected async setupApp(): Promise<express.Express> {
    this.authenticator.use(new JwtStrategy({
      audience: this.data.token.audience,
      issuer: this.data.token.issuer,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(this.data.token.scheme),
      secretOrKey: this.data.token.secret,
    }, (req: express.Request, payload: any, done: VerifiedCallback) => this.createTokenSession(req, payload, done)));

    const app = express();
    app.use(this.authenticator.initialize());

    if (this.data.expose.metrics) {
      app.use((req, res, next) => this.traceRequest(req, res, next));
      app.get('/metrics', (req, res) => this.getMetrics(req, res));
    }

    if (this.data.expose.graph) {
      this.graph = await this.services.createService<GraphSchema, GraphSchemaData>(this.data.graph);
      await this.graph.start();

      app.use('/graph', expressGraphQl({
        graphiql: this.data.expose.graphiql,
        schema: this.graph.schema,
      }));
    }

    return app;
  }
}
