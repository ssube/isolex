import * as escape from 'escape-html';
import { GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Context } from 'src/entity/Context';

import { LabelEntity } from './base/LabelEntity';

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
      this.reactions = Array.from(options.reactions);
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
  fields: {
    body: {
      type: GraphQLString,
    },
    id: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
  },
  name: 'Message',
});

export const GRAPH_INPUT_MESSAGE = new GraphQLInputObjectType({
  fields: {
    body: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
  },
  name: 'MessageInput',
});
