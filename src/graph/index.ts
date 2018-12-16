import * as express from 'express';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Inject } from 'noicejs';
import { Connection } from 'typeorm';

import { ChildService, ChildServiceOptions } from 'src/ChildService';
import { Command, CommandGraph, CommandInputGraph } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message, MessageGraph, MessageInputGraph } from 'src/entity/Message';
import { SessionRequiredError } from 'src/error/SessionRequiredError';
import { ServiceModule } from 'src/module/ServiceModule';
import { ServiceGraph } from 'src/Service';
import { Dict, pairsToDict } from 'src/utils/Map';

const ServiceGraphList = new GraphQLList(ServiceGraph);
const CommandInputGraphList = new GraphQLList(CommandInputGraph);
const MessageInputGraphList = new GraphQLList(MessageInputGraph);

export type GraphSchemaData = any;
export type GraphSchemaOptions = ChildServiceOptions<GraphSchemaData>;

@Inject('bot', 'services', 'storage')
export class GraphSchema extends ChildService<GraphSchemaData> {
  public readonly schema: GraphQLSchema;

  protected readonly services: ServiceModule;
  protected readonly storage: Connection;

  constructor(options: GraphSchemaOptions) {
    super(options);

    this.services = options.services;
    this.storage = options.storage;

    this.schema = new GraphQLSchema({
      mutation: new GraphQLObjectType({
        fields: {
          emitCommands: {
            args: {
              commands: {
                type: CommandInputGraphList,
              },
            },
            resolve: (_, args: Dict<any>, req: express.Request) => {
              return this.emitCommands(args, req);
            },
            type: CommandGraph,
          },
          sendMessages: {
            args: {
              messages: {
                type: MessageInputGraphList,
              },
            },
            resolve: (_, args: Dict<any>, req: express.Request) => {
              return this.sendMessages(args, req);
            },
            type: MessageGraph,
          },
        },
        name: 'mutation',
      }),
      query: new GraphQLObjectType({
        fields: {
          command: {
            args: {
              id: {
                type: GraphQLString,
              },
            },
            resolve: (_, args: Dict<any>, req: express.Request) => {
              return this.getCommand(args, req);
            },
            type: CommandGraph,
          },
          message: {
            fields: {
              id: {
                type: GraphQLString,
              },
            },
            resolve: (_, args: Dict<any>, req: express.Request) => {
              return this.getMessage(args, req);
            },
            type: MessageGraph,
          },
          service: {
            fields: {
              id: {
                type: GraphQLString,
              },
            },
            resolve: (_, args: Dict<any>, req: express.Request) => {
              return this.getService(args, req);
            },
            type: ServiceGraph,
          },
          services: {
            resolve: (_, args: Dict<any>, req: express.Request) => {
              return this.getServices(args, req);
            },
            type: ServiceGraphList,
          },
        },
        name: 'query',
      }),
    });
  }

  public async start() {

  }

  public async stop() {

  }

  public async emitCommands(args: any, req: express.Request) {
    const context = req.user as Context | undefined;
    this.logger.debug({ args, context }, 'send message');

    if (!context) {
      throw new SessionRequiredError();
    }

    const commands = [];
    for (const data of args.commands) {
      const { labels: rawLabels, noun, verb } = data;
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
    const context = req.user as Context | undefined;
    this.logger.debug({ args, context }, 'send message');

    if (!context) {
      throw new SessionRequiredError();
    }

    const messages = [];
    for (const data of args.messages) {
      const { body, type } = data;
      messages.push(new Message({
        body,
        context,
        reactions: [],
        type,
      }));
    }
    return this.bot.sendMessage(...messages);
  }

  public getCommand(args: any, req: express.Request) {
    this.logger.debug({ args }, 'get command');
    const repository = this.storage.getRepository(Command);
    const { id } = args;
    return repository.findOne(id);
  }

  public getMessage(args: any, req: express.Request) {
    this.logger.debug({ args }, 'get message');
    const repository = this.storage.getRepository(Message);
    const { id } = args;
    return repository.findOne(id);
  }

  public getService(args: any, req: express.Request) {
    this.logger.debug({ args }, 'getting service');
    const { id } = args;
    return this.services.getService(id);
  }

  public getServices(args: any, req: express.Request) {
    this.logger.debug('getting services');
    try {
      return this.services.listServices();
    } catch (err) {
      this.logger.error(err, 'error getting services');
      return [];
    }
  }
}
