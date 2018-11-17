import * as escape from 'escape-html';
import { Context } from 'src/entity/Context';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface MessageOptions {
  body: string;
  context: Context;
  reactions: Array<string>;
  type: string;
}

@Entity()
export class Message implements MessageOptions {
  public static create(options: MessageOptions): Message {
    const msg = new Message();
    msg.body = options.body;
    msg.context = Context.create(options.context);
    msg.reactions = Array.from(options.reactions);
    msg.type = options.type;
    return msg;
  }

  public static reply(body: string, context: Context) {
    return Message.create({
      body,
      context,
      reactions: [],
      type: TYPE_TEXT,
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

  @Column('simple-array')
  public reactions: Array<string>;

  /**
   * MIME type of the message. Typically `text/plain`, but can be an `image/*` or `audio/*` type, depending on the
   * listener.
   */
  @Column()
  public type: string;

  /**
   * @TODO: move this to each listener
   */
  get escaped(): string {
    return escape(this.body);
  }
}
