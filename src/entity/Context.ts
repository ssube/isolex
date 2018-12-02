import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Session } from './auth/Session';

export interface ContextData {
  listenerId: string;
  roomId: string;
  session?: Session;
  threadId: string;
  userId: string;
  userName: string;
}

@Entity()
export class Context implements ContextData {
  public static create(options: ContextData) {
    const ctx = new Context();
    ctx.listenerId = options.listenerId;
    ctx.roomId = options.roomId;
    if (options.session) {
      ctx.session = options.session;
    }
    ctx.threadId = options.threadId;
    ctx.userId = options.userId;
    ctx.userName = options.userName;
    return ctx;
  }

  public extend(options: Partial<ContextData>): Context {
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
    const session = this.session ? this.session.toJSON() : {};
    return {
      id: this.id,
      listenerId: this.listenerId,
      roomId: this.roomId,
      session,
      threadId: this.threadId,
      userId: this.userId,
      userName: this.userName,
    };
  }
}
