import express from 'express';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Inject } from 'noicejs';

import { INJECT_CLOCK, INJECT_SERVICES } from '../../BaseService';
import { BotService, BotServiceData, BotServiceOptions, INJECT_BOT, INJECT_STORAGE } from '../../BotService';
import { Command, CommandVerb, GRAPH_INPUT_COMMAND, GRAPH_OUTPUT_COMMAND } from '../../entity/Command';
import { GRAPH_INPUT_CONTEXT } from '../../entity/Context';
import { GRAPH_INPUT_MESSAGE, GRAPH_OUTPUT_MESSAGE, Message } from '../../entity/Message';
import { getRequestContext } from '../../listener/ExpressListener';
import { ServiceModule } from '../../module/ServiceModule';
import { GRAPH_OUTPUT_SERVICE, ServiceMetadata } from '../../Service';
import { Storage } from '../../storage';
import { mustExist } from '../../utils';
import { pairsToMap } from '../../utils/Map';

const GRAPH_INPUT_COMMAND_LIST = new GraphQLList(GRAPH_INPUT_COMMAND);
const GRAPH_INPUT_MESSAGE_LIST = new GraphQLList(GRAPH_INPUT_MESSAGE);
const GRAPH_OUTPUT_COMMAND_LIST = new GraphQLList(GRAPH_OUTPUT_COMMAND);
const GRAPH_OUTPUT_MESSAGE_LIST = new GraphQLList(GRAPH_OUTPUT_MESSAGE);
const GRAPH_OUTPUT_SERVICE_LIST = new GraphQLList(GRAPH_OUTPUT_SERVICE);

interface GraphIDOptions {
  id: string;
}

interface GraphCommandOptions {
  commands: Array<{
    data: Array<{
      name: string;
      value: Array<string>;
    }>;
    labels: Array<{
      name: string;
      value: string;
    }>;
    noun: string;
    verb: CommandVerb;
  }>;
}

interface GraphMessageOptions {
  messages: Array<{
    body: string;
    labels: Array<{
      name: string;
      value: string;
    }>;
    reactions: Array<string>;
    type: string;
  }>;
}

export type GraphSchemaData = BotServiceData;

@Inject(INJECT_BOT, INJECT_CLOCK, INJECT_STORAGE)
export class GraphSchema extends BotService<GraphSchemaData> {
  public readonly schema: GraphQLSchema;

  protected readonly services: ServiceModule;
  protected readonly storage: Storage;

  constructor(options: BotServiceOptions<GraphSchemaData>) {
    super(options, 'isolex#/definitions/service-graph');

    this.services = mustExist(options[INJECT_SERVICES]);
    this.storage = mustExist(options[INJECT_STORAGE]);

    this.schema = new GraphQLSchema({
      mutation: this.createMutation(),
      query: this.createQuery(),
    });
  }

  public async executeCommands(args: GraphCommandOptions, req: express.Request) {
    const context = getRequestContext(req);
    this.logger.debug({ args, context }, 'execute commands');

    const commands = [];
    for (const data of args.commands) {
      const { noun, verb } = data;
      const cmd = new Command({
        context,
        data: pairsToMap(data.data),
        labels: pairsToMap(data.labels),
        noun,
        verb,
      });
      commands.push(cmd);
    }
    return this.bot.executeCommand(...commands);
  }

  public async sendMessages(args: GraphMessageOptions, req: express.Request) {
    const context = getRequestContext(req);
    this.logger.debug({ args, context }, 'send messages');

    const messages = [];
    for (const data of args.messages) {
      const { body, type } = data;
      const msg = new Message({
        body,
        context,
        labels: pairsToMap(data.labels),
        reactions: data.reactions,
        type,
      });
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

  /* eslint-disable @typescript-eslint/no-explicit-any */
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
          args: {
            id: { type: GraphQLString },
          },
          resolve: (_, args: any, req: express.Request) => this.getMessage(args, req),
          type: GRAPH_OUTPUT_MESSAGE,
        },
        service: {
          args: {
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
