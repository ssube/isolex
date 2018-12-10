import * as express from 'express';
import * as expressGraphQl from 'express-graphql';
import { buildSchema } from 'graphql';
import * as http from 'http';
import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from 'passport-jwt';
import { Counter, Registry } from 'prom-client';
import { Connection, Repository } from 'typeorm';

import { ChildServiceOptions } from 'src/ChildService';
import { Token } from 'src/entity/auth/Token';
import { User } from 'src/entity/auth/User';
import { Command } from 'src/entity/Command';
import { Context, ContextData } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { ServiceModule } from 'src/module/ServiceModule';
import { pairsToDict } from 'src/utils/Map';

import { Listener } from './Listener';
import { Session, SessionListener } from './SessionListener';

const schema = buildSchema(require('../schema.gql'));

export interface ExpressListenerData {
  expose: {
    graph: boolean;
    graphiql: boolean;
    metrics: boolean;
  };
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

export type ExpressListenerOptions = ChildServiceOptions<ExpressListenerData>;

@Inject('bot', 'metrics', 'services', 'storage')
export class ExpressListener extends SessionListener<ExpressListenerData> implements Listener {
  protected readonly app: express.Express;
  protected readonly authenticator: passport.Authenticator;
  protected readonly metrics: Registry;
  protected readonly requestCounter: Counter;
  protected readonly services: ServiceModule;
  protected readonly storage: Connection;
  protected readonly tokenRepository: Repository<Token>;

  protected server?: http.Server;

  constructor(options: ExpressListenerOptions) {
    super(options);

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
    this.authenticator = new passport.Passport();
    this.app = express();
    this.setupApp();
  }

  public async start() {
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
  }

  public async send() {
    this.logger.warn('express listener is not able to emit messages');
  }

  public async fetch(): Promise<Array<Message>> {
    this.logger.warn('express listener is not able to fetch messages');
    return [];
  }

  public async emitCommands(args: any, req: express.Request) {
    this.logger.debug({ args }, 'emit command');
    const commands = [];
    for (const data of args.commands) {
      const { context: contextData = {}, labels: rawLabels, noun, verb } = data;
      const context = await this.createContext(req, contextData);
      commands.push(new Command({
        context,
        data: args,
        labels: pairsToDict(rawLabels),
        noun,
        verb,
      }));
    }
    return this.bot.emitCommand(...commands);
  }

  public async sendMessages(args: any, req: express.Request) {
    this.logger.debug({ args }, 'send message');
    const messages = [];
    for (const data of args.messages) {
      const { body, context: contextData = {}, type } = data;
      const context = await this.createContext(req, contextData);
      messages.push(new Message({
        body,
        context,
        reactions: [],
        type,
      }));
    }
    return this.bot.sendMessage(...messages);
  }

  public getCommand(args: any) {
    this.logger.debug({ args }, 'get command');
    const repository = this.storage.getRepository(Command);
    const { id } = args;
    return repository.findOne(id);
  }

  public getMessage(args: any) {
    this.logger.debug({ args }, 'get message');
    const repository = this.storage.getRepository(Message);
    const { id } = args;
    return repository.findOne(id);
  }

  public getService(args: any) {
    this.logger.debug({ args }, 'getting service');
    const { id } = args;
    return this.services.getService(id);
  }

  public getServices() {
    this.logger.debug('getting services');
    try {
      return this.services.listServices();
    } catch (err) {
      this.logger.error(err, 'error getting services');
      return [];
    }
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
    const token = await this.tokenRepository.findOne(data);
    if (isNil(token)) {
      return done(undefined, false);
    }

    const session = await this.createSession(token.user.id, token.user);
    done(null, session);
  }

  protected async createContext(req: express.Request, data: ContextData): Promise<Context> {
    const session = req.user as Session | undefined;
    const user = session ? session.user : undefined;

    this.logger.debug({ data, req, session }, 'creating context for request');
    return new Context({
      ...data,
      source: this,
      user,
    });
  }

  protected setupApp() {
    this.authenticator.use(new JwtStrategy({
      audience: this.data.token.audience,
      issuer: this.data.token.issuer,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(this.data.token.scheme),
      secretOrKey: this.data.token.secret,
    }, (req: express.Request, payload: any, done: VerifiedCallback) => this.createTokenSession(req, payload, done)));

    this.app.use(this.authenticator.initialize());

    if (this.data.expose.metrics) {
      this.app.use((req, res, next) => this.traceRequest(req, res, next));
      this.app.get('/metrics', (req, res) => this.getMetrics(req, res));
    }

    if (this.data.expose.graph) {
      const mutations = {
        // mutation
        emitCommands: (args: any, req: express.Request) => this.emitCommands(args, req),
        sendMessages: (args: any, req: express.Request) => this.sendMessages(args, req),
      };
      const queries = {
        // query
        command: (args: any) => this.getCommand(args),
        message: (args: any) => this.getCommand(args),
        service: (args: any) => this.getService(args),
        services: () => this.getServices(),
      };
      this.app.use('/graph', expressGraphQl({
        graphiql: this.data.expose.graphiql,
        rootValue: {
          ...mutations,
          ...queries,
        },
        schema,
      }));
    }
  }
}
