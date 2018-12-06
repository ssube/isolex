import * as express from 'express';
import * as expressGraphQl from 'express-graphql';
import { buildSchema } from 'graphql';
import * as http from 'http';
import { isNil } from 'lodash';
import { BaseError, Inject } from 'noicejs';
import { Counter, Registry } from 'prom-client';
import { Connection } from 'typeorm';

import { ChildServiceOptions } from 'src/ChildService';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { pairsToDict } from 'src/utils/Map';

import { BaseListener } from './BaseListener';
import { Listener } from './Listener';

const schema = buildSchema(require('../schema.gql'));

export interface ExpressListenerData {
  graph: {
    repl: boolean;
  };
  listen: {
    address: string;
    port: number;
  };
}

export type ExpressListenerOptions = ChildServiceOptions<ExpressListenerData>;

@Inject('metrics', 'storage')
export class ExpressListener extends BaseListener<ExpressListenerData> implements Listener {
  protected readonly metrics: Registry;
  protected readonly storage: Connection;

  protected metricsCounter: Counter;
  protected requestCounter: Counter;

  protected app: express.Express;
  protected server?: http.Server;

  constructor(options: ExpressListenerOptions) {
    super(options);

    if (isNil(options.metrics) || isNil(options.storage)) {
      throw new BaseError('missing dependencies');
    }

    this.metrics = options.metrics;
    this.storage = options.storage;

    this.app = express();
    this.app.use((req, res, next) => this.traceRequest(req, res, next));
    this.app.use('/graph', expressGraphQl({
      graphiql: this.data.graph.repl,
      rootValue: {
        // mutation
        emitCommands: (args: any) => this.emitCommands(args),
        sendMessages: (args: any) => this.sendMessages(args),
        // query
        command: (args: any) => this.getCommand(args),
        message: (args: any) => this.getCommand(args),
        service: (args: any) => this.getService(args),
        services: () => this.getServices(),
      },
      schema,
    }));
    this.app.get('/metrics', (req, res) => this.getMetrics(req, res));
  }

  public async start() {
    this.server = await new Promise<http.Server>((res, rej) => {
      let server: http.Server;
      server = this.app.listen(this.data.listen.port, this.data.listen.address, () => {
        res(server);
      });
    });

    this.metricsCounter = new Counter({
      help: 'get metrics requests through the express listener',
      labelNames: ['service_id', 'service_kind', 'service_name'],
      name: 'express_metrics',
      registers: [this.metrics],
    });
    this.requestCounter = new Counter({
      help: 'all requests through this express listener',
      labelNames: ['service_id', 'service_kind', 'service_name', 'request_path'],
      name: 'express_requests',
      registers: [this.metrics],
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
    throw new NotImplementedError();
  }

  public emitCommands(args: any) {
    this.logger.debug({ args }, 'emit command');
    const commands = args.commands.map((data: any) => {
      const { context = {}, labels: rawLabels, noun, verb } = data;
      return new Command({
        context: this.createContext(context),
        data: args,
        labels: pairsToDict(rawLabels),
        noun,
        verb,
      });
    });
    return this.bot.emitCommand(...commands);
  }

  public sendMessages(args: any) {
    this.logger.debug({ args }, 'send message');
    const messages = args.messages.map((data: any) => {
      const { body, context = {}, type } = data;
      return new Message({
        body,
        context: this.createContext(context),
        reactions: [],
        type,
      });
    });
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
    return this.bot.getService(id);
  }

  public getServices() {
    this.logger.debug('getting services');
    try {
      return this.bot.listServices();
    } catch (err) {
      this.logger.error(err, 'error getting services');
      return [];
    }
  }

  public getMetrics(req: express.Request, res: express.Response) {
    this.metricsCounter.labels(this.id, this.kind, this.name).inc();
    res.set('Content-Type', this.metrics.contentType);
    res.end(this.metrics.metrics());
  }

  public traceRequest(req: express.Request, res: express.Response, next: Function) {
    this.logger.debug({ req, res }, 'handling request');
    this.requestCounter.labels(this.id, this.kind, this.name, req.path).inc();
    next();
  }

  protected createContext(args: any): Context {
    return new Context({
      listenerId: this.id,
      roomId: args.roomId || '',
      threadId: args.threadId || '',
      userId: args.userId || '',
      userName: args.userName || '',
    });
  }
}
