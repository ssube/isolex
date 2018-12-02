import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Session } from './auth/Session';

export interface ContextData {
  listenerId: string;
  roomId: string;
  threadId: string;
  userId: string;
  userName: string;
}

export interface ContextOptions extends ContextData {
  session?: Session;
}

@Entity()
export class Context implements ContextOptions {
  public static create(options: ContextOptions) {
    const ctx = new Context();
    ctx.listenerId = options.listenerId;
    ctx.roomId = options.roomId;
    ctx.threadId = options.threadId;
    ctx.userId = options.userId;
    ctx.userName = options.userName;
    return ctx;
  }

  public extend(options: Partial<ContextOptions>): Context {
    const ctx = Context.create(this);
    if (options.session) {
      ctx.session = Session.create(options.session);
    }
    return ctx;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public listenerId: string;

  @Column()
  public roomId: string;

  @ManyToOne((type) => Session, (session) => session.id, {
    cascade: true,
    nullable: true,
  })
  public session?: Session;

  @Column()
  public threadId: string;

  @Column()
  public userId: string;

  @Column()
  public userName: string;


  public toJSON(): any {
    return {
      id: this.id,
      listenerId: this.listenerId,
      roomId: this.roomId,
      threadId: this.threadId,
      userId: this.userId,
      userName: this.userName,
    };
  }
}
