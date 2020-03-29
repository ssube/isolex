import { doesExist, mustExist } from '@apextoaster/js-utils';
import express, { Request, Response } from 'express';
import http from 'http';
import { isNil } from 'lodash';
import { Container, Inject } from 'noicejs';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from 'passport-jwt';
import { Registry } from 'prom-client';
import { Repository } from 'typeorm';

import { Listener, ListenerData } from '.';
import { INJECT_CLOCK, INJECT_METRICS, INJECT_SERVICES } from '../BaseService';
import { BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Endpoint } from '../endpoint';
import { JwtFields, Token } from '../entity/auth/Token';
import { UserRepository } from '../entity/auth/UserRepository';
import { Context } from '../entity/Context';
import { Message } from '../entity/Message';
import { SessionRequiredError } from '../error/SessionRequiredError';
import { ServiceModule } from '../module/ServiceModule';
import { ServiceMetadata } from '../Service';
import { Storage } from '../storage';
import { createServiceCounter, StringCounter } from '../utils/Metrics';
import { SessionListener } from './SessionListener';

export interface ExpressListenerData extends ListenerData {
  endpoints: Array<ServiceMetadata>;
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

@Inject(INJECT_CLOCK, INJECT_METRICS, INJECT_STORAGE)
export class ExpressListener extends SessionListener<ExpressListenerData> implements Listener {
  protected readonly container: Container;
  protected readonly metrics: Registry;
  protected readonly requestCounter: StringCounter;
  protected readonly services: ServiceModule;
  protected readonly storage: Storage;
  protected readonly tokenRepository: Repository<Token>;
  protected readonly userRepository: UserRepository;

  protected express?: express.Express;
  protected passport?: passport.Authenticator;
  protected server?: http.Server;

  constructor(options: BotServiceOptions<ExpressListenerData>) {
    super(options, 'isolex#/definitions/service-listener-express');

    this.container = options.container;
    this.metrics = mustExist(options[INJECT_METRICS]);
    this.services = mustExist(options[INJECT_SERVICES]);
    this.storage = mustExist(options[INJECT_STORAGE]);

    this.requestCounter = createServiceCounter(this.metrics, {
      help: 'all requests through this express listener',
      labelNames: ['requestClient', 'requestHost', 'requestPath'],
      name: 'express_request',
      registers: [this.metrics],
    });

    this.tokenRepository = this.storage.getRepository(Token);
    this.userRepository = this.storage.getCustomRepository(UserRepository);
  }

  public async start() {
    await super.start();

    this.passport = await this.setupPassport();
    this.express = await this.setupExpress();
    this.server = await this.createServer();
  }

  public async stop() {
    if (doesExist(this.server)) {
      this.server.close();
    }

    await super.stop();
  }

  public async send() {
    this.logger.warn('express listener is not able to send messages');
  }

  public async fetch(): Promise<Array<Message>> {
    this.logger.warn('express listener is not able to fetch messages');
    return [];
  }

  public traceRequest(req: Request, res: Response, next: Function) {
    this.logger.debug({ req, res }, 'handling request');
    this.requestCounter.inc({
      requestHost: req.hostname,
      requestPath: req.path,
      serviceId: this.id,
      serviceKind: this.kind,
      serviceName: this.name,
    });
    next();
  }

  protected createServer(): Promise<http.Server> {
    return new Promise<http.Server>((res, rej) => {
      const app = mustExist(this.express);
      /* eslint-disable prefer-const */
      let server: http.Server;
      server = app.listen(this.data.listen.port, this.data.listen.address, () => {
        res(server);
      });
    });
  }

  protected async createTokenSession(data: JwtFields, done: VerifiedCallback) {
    this.logger.debug({ data }, 'creating session from token');
    const token = await this.tokenRepository.findOne({
      id: data.jti,
    }, {
      relations: ['user'],
    });

    if (isNil(token)) {
      this.logger.warn('token not found');
      done(undefined, false);
      return;
    }

    if (isNil(token.user)) {
      this.logger.error({ token }, 'token user not found');
      done(undefined, false);
      return;
    }

    await this.userRepository.loadRoles(token.user);
    this.logger.debug({ roles: token.user.roles }, 'loaded user roles');

    const session = token.session();
    const uid = mustExist(token.user.id);
    this.sessions.set(uid, session);
    this.logger.debug({ session, token }, 'created session for token');

    const context = await this.createContext({
      channel: {
        id: '',
        thread: '',
      },
      name: token.user.name,
      token,
      uid,
      user: token.user,
    });
    this.logger.debug({ context, token }, 'created context for token');

    done(undefined, context);
  }

  protected async setupExpress(): Promise<express.Express> {
    let app = express();

    if (doesExist(this.passport)) {
      app = app.use(this.passport.initialize());
    }

    app = app.use((req, res, next) => {
      this.traceRequest(req, res, next);
    });

    app = await this.setupEndpoints(app);

    return app;
  }

  protected async setupEndpoints(app: express.Express): Promise<express.Express> {
    for (const metadata of this.data.endpoints) {
      const endpoint = this.services.getService<Endpoint>(metadata);
      const router = await endpoint.createRouter({
        passport: mustExist(this.passport),
      });
      for (const path of endpoint.paths) {
        this.logger.debug({
          endpoint: endpoint.name,
          path,
        }, 'registering endpoint at path');
        app.use(path, router);
      }
    }

    return app;
  }

  protected async setupPassport(): Promise<passport.Authenticator> {
    const auth = new passport.Passport();
    auth.use(new JwtStrategy({
      audience: this.data.token.audience,
      issuer: this.data.token.issuer,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(this.data.token.scheme),
      secretOrKey: this.data.token.secret,
    }, (payload: JwtFields, done: VerifiedCallback) => {
      this.createTokenSession(payload, done).catch((err) => {
        this.logger.error(err, 'error creating token session');
      });
    }));

    // sessions are saved when created and keyed by uid, so pass that
    auth.serializeUser((ctx: Context, done) => {
      this.logger.debug({ ctx }, 'serializing request context');
      /* eslint-disable-next-line no-null/no-null */
      done(null, ctx.uid);
    });

    // grab existing session
    auth.deserializeUser((ctx: Context, done) => {
      this.logger.debug({ ctx }, 'deserializing request context');
      /* eslint-disable-next-line no-null/no-null */
      done(null, this.sessions.get(ctx.uid));
    });

    return auth;
  }
}

export function getRequestContext(req: Request): Context {
  /* eslint-disable-next-line no-null/no-null, @typescript-eslint/no-explicit-any */
  const user = req.user as any;
  if (doesExist(user)) {
    return user;
  } else {
    throw new SessionRequiredError();
  }
}
