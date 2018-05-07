import * as escape from 'escape-html';
import { Context } from 'src/entity/Context';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export interface MessageOptions {
  body: string;
  context: Context;
  reactions: Array<string>;
}

@Entity()
export class Message implements MessageOptions {
  public static create(options: MessageOptions): Message {
    const msg = new Message();
    msg.body = options.body;
    msg.context = Context.create(options.context);
    msg.reactions = Array.from(options.reactions || []);
    return msg;
  }

  @Column()
  public body: string;

  @OneToOne((type) => Context, (context) => context.id)
  public context: Context;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('simple-array')
  public reactions: Array<string>;

  get escaped(): string {
    return escape(this.body);
  }
}
