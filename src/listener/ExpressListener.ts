import * as express from 'express';
import * as expressGraphQl from 'express-graphql';
import { buildSchema } from 'graphql';
import * as http from 'http';
import { Inject } from 'noicejs';
import { Connection } from 'typeorm';

import { ChildServiceOptions } from 'src/ChildService';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
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

export interface ExpressListenerOptions extends ChildServiceOptions<ExpressListenerData> {
  storage: Connection;
}

@Inject('storage')
export class ExpressListener extends BaseListener<ExpressListenerData> implements Listener {
  protected app: express.Express;
  protected server?: http.Server;
  protected storage: Connection;

  constructor(options: ExpressListenerOptions) {
    super(options);

    this.storage = options.storage;

    this.app = express();
    this.app.use('/graph', expressGraphQl({
      graphiql: this.data.graph.repl,
      rootValue: {
        // mutation
        emitCommand: (args: any) => this.emitCommand(args),
        sendMessage: (args: any) => this.sendMessage(args),
        // query
        command: (args: any) => this.getCommand(args),
        message: (args: any) => this.getCommand(args),
        service: (args: any) => this.getService(args),
        services: () => this.getServices(),
      },
      schema,
    }));
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

  public async emit() {

  }

  public async fetch() {
    return [];
  }

  public emitCommand(args: any) {
    const { command } = args;
    const { labels: rawLabels, noun, verb } = command;
    this.logger.debug({ noun, verb }, 'emit command');
    return this.bot.handle(Command.create({
      context: this.createContext(),
      data: args,
      labels: pairsToDict(rawLabels),
      noun,
      verb,
    }));
  }

  public sendMessage(args: any) {
    const { message } = args;
    const { body, type } = message;
    this.logger.debug({ body, type }, 'send message');
    return this.bot.dispatch(Message.create({
      body,
      context: this.createContext(),
      reactions: [],
      type,
    }));
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
    const { id } = args;
    this.logger.debug({ id }, 'getting service');
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

  protected createContext(): Context {
    return Context.create({
      listenerId: this.id,
      roomId: '',
      threadId: '',
      userId: '',
      userName: '',
    });
  }
}
