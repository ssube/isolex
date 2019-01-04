import * as express from 'express';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Inject } from 'noicejs';
import { Connection } from 'typeorm';

import { BotService, BotServiceData, BotServiceOptions } from 'src/BotService';
import { Command, CommandOptions, GRAPH_INPUT_COMMAND, GRAPH_OUTPUT_COMMAND } from 'src/entity/Command';
import { Context, GRAPH_INPUT_CONTEXT } from 'src/entity/Context';
import { GRAPH_INPUT_MESSAGE, GRAPH_OUTPUT_MESSAGE, Message, MessageOptions } from 'src/entity/Message';
import { SessionRequiredError } from 'src/error/SessionRequiredError';
import { ServiceModule } from 'src/module/ServiceModule';
import { GRAPH_OUTPUT_SERVICE, ServiceMetadata } from 'src/Service';
import { dictToMap } from 'src/utils/Map';

const GRAPH_INPUT_COMMAND_LIST = new GraphQLList(GRAPH_INPUT_COMMAND);
const GRAPH_INPUT_MESSAGE_LIST = new GraphQLList(GRAPH_INPUT_MESSAGE);
const GRAPH_OUTPUT_COMMAND_LIST = new GraphQLList(GRAPH_OUTPUT_COMMAND);
const GRAPH_OUTPUT_MESSAGE_LIST = new GraphQLList(GRAPH_OUTPUT_MESSAGE);
const GRAPH_OUTPUT_SERVICE_LIST = new GraphQLList(GRAPH_OUTPUT_SERVICE);

interface GraphIDOptions {
  id: string;
}

interface GraphCommandOptions {
  commands: Array<CommandOptions>;
}

interface GraphMessageOptions {
  messages: Array<MessageOptions>;
}

export type GraphSchemaData = BotServiceData;
export type GraphSchemaOptions = BotServiceOptions<GraphSchemaData>;

@Inject('bot', 'services', 'storage')
export class GraphSchema extends BotService<GraphSchemaData> {
  public readonly schema: GraphQLSchema;

  protected readonly services: ServiceModule;
  protected readonly storage: Connection;

  constructor(options: GraphSchemaOptions) {
    super(options, 'isolex#/definitions/service-graph');

    this.services = options.services;
    this.storage = options.storage;

    this.schema = new GraphQLSchema({
      mutation: this.createMutation(),
      query: this.createQuery(),
    });
  }

  public async executeCommands(args: GraphCommandOptions, req: express.Request) {
    const context = req.user as Context | undefined;
    this.logger.debug({ args, context }, 'execute commands');

    if (!context) {
      throw new SessionRequiredError();
    }

    const commands = [];
    for (const data of args.commands) {
      const cmd = new Command();
      cmd.context = context;
      cmd.labels = dictToMap(data.labels);
      cmd.noun = data.noun;
      cmd.verb = data.verb;
      commands.push(cmd);
    }
    return this.bot.executeCommand(...commands);
  }

  public async sendMessages(args: GraphMessageOptions, req: express.Request) {
    const context = req.user as Context | undefined;
    this.logger.debug({ args, context }, 'send messages');

    if (!context) {
      throw new SessionRequiredError();
    }

    const messages = [];
    for (const data of args.messages) {
      const { body, type } = data;
      const msg = new Message();
      msg.body = data.body;
      msg.context = data.context;
      msg.reactions = data.reactions;
      msg.type = data.type;
      messages.push(msg);
    }
    return this.bot.sendMessage(...messages);
  }

  public getCommand(args: GraphIDOptions, req: express.Request) {
    this.logger.debug({ args }, 'get command');
    const repository = this.storage.getRepository(Command);
    const { id } = args;
    return repository.findOne(id);
  }

  public getMessage(args: GraphIDOptions, req: express.Request) {
    this.logger.debug({ args }, 'get message');
    const repository = this.storage.getRepository(Message);
    const { id } = args;
    return repository.findOne(id);
  }

  public getService(args: ServiceMetadata, req: express.Request) {
    this.logger.debug({ args }, 'getting service');
    return this.services.getService(args);
  }

  public getServices(args: unknown, req: express.Request) {
    this.logger.debug('getting services');
    return this.services.listServices();
  }

  /* tslint:disable:no-any */
  protected createMutation() {
    return new GraphQLObjectType({
      fields: {
        executeCommands: {
          args: {
            commands: { type: GRAPH_INPUT_COMMAND_LIST },
            context: { type: GRAPH_INPUT_CONTEXT },
          },
          resolve: (_, args: any, req: express.Request) => this.executeCommands(args, req),
          type: GRAPH_OUTPUT_COMMAND_LIST,
        },
        sendMessages: {
          args: {
            context: { type: GRAPH_INPUT_CONTEXT },
            messages: { type: GRAPH_INPUT_MESSAGE_LIST },
          },
          resolve: (_, args: any, req: express.Request) => this.sendMessages(args, req),
          type: GRAPH_OUTPUT_MESSAGE_LIST,
        },
      },
      name: 'mutation',
    });
  }

  protected createQuery() {
    return new GraphQLObjectType({
      fields: {
        command: {
          args: {
            id: { type: GraphQLString },
          },
          resolve: (_, args: any, req: express.Request) => this.getCommand(args, req),
          type: GRAPH_OUTPUT_COMMAND,
        },
        message: {
          fields: {
            id: { type: GraphQLString },
          },
          resolve: (_, args: any, req: express.Request) => this.getMessage(args, req),
          type: GRAPH_OUTPUT_MESSAGE,
        },
        service: {
          fields: {
            id: { type: GraphQLString },
          },
          resolve: (_, args: any, req: express.Request) => this.getService(args, req),
          type: GRAPH_OUTPUT_SERVICE,
        },
        services: {
          resolve: (_, args: any, req: express.Request) => this.getServices(args, req),
          type: GRAPH_OUTPUT_SERVICE_LIST,
        },
      },
      name: 'query',
    });
  }
}
