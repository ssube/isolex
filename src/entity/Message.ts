import * as escape from 'escape-html';
import { GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { LabelEntity } from 'src/entity/base/LabelEntity';
import { Context, GRAPH_OUTPUT_CONTEXT } from 'src/entity/Context';
import { GRAPH_INPUT_NAME_MULTI_VALUE_PAIR, GRAPH_INPUT_NAME_VALUE_PAIR } from 'src/schema/graph/input/Pairs';
import { GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR, GRAPH_OUTPUT_NAME_VALUE_PAIR } from 'src/schema/graph/output/Pairs';

export interface MessageOptions {
  body: string;
  context: Context;
  reactions: Array<string>;
  type: string;
}

export const TABLE_MESSAGE = 'message';

@Entity(TABLE_MESSAGE)
export class Message extends LabelEntity implements MessageOptions {
  public static isMessage(it: any): it is Message {
    return it instanceof Message;
  }

  public static reply(context: Context, type: string, body: string): Message {
    return new Message({
      body,
      context,
      reactions: [],
      type,
    });
  }

  @Column()
  public body: string;

  @OneToOne((type) => Context, (context) => context.id, {
    cascade: true,
  })
  @JoinColumn()
  public context: Context;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('simple-json')
  public reactions: Array<string>;

  /**
   * MIME type of the message. Typically `text/plain`, but can be an `image/*` or `audio/*` type, depending on the
   * listener.
   */
  @Column()
  public type: string;

  constructor(options?: MessageOptions) {
    super();

    if (options) {
      this.body = options.body;
      this.context = options.context;
      this.reactions = Array.from(options.reactions || []);
      this.type = options.type;
    }
  }

  /**
   * @TODO: move this to each listener
   */
  get escaped(): string {
    return escape(this.body);
  }

  public toJSON(): object {
    return {
      body: this.body,
      context: this.context.toJSON(),
      id: this.id,
      reactions: Array.from(this.reactions),
      type: this.type,
    };
  }
}

export const GRAPH_OUTPUT_MESSAGE = new GraphQLObjectType({
  description: 'a message sent from the bot',
  fields: {
    body: {
      type: GraphQLString,
    },
    context: {
      type: GRAPH_OUTPUT_CONTEXT,
    },
    data: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR),
    },
    id: {
      type: GraphQLString,
    },
    labels: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_VALUE_PAIR),
    },
    reactions: {
      type: new GraphQLList(GraphQLString),
    },
    type: {
      type: GraphQLString,
    },
  },
  name: 'Message',
});

export const GRAPH_INPUT_MESSAGE = new GraphQLInputObjectType({
  description: 'a message sent to the bot',
  fields: {
    body: {
      type: GraphQLString,
    },
    data: {
      type: new GraphQLList(GRAPH_INPUT_NAME_MULTI_VALUE_PAIR),
    },
    labels: {
      type: new GraphQLList(GRAPH_INPUT_NAME_VALUE_PAIR),
    },
    type: {
      type: GraphQLString,
    },
  },
  name: 'MessageInput',
});
