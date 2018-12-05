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

  constructor(options?: ContextData) {
    if (options) {
      this.listenerId = options.listenerId;
      this.roomId = options.roomId;
      this.session = options.session;
      this.threadId = options.threadId;
      this.userId = options.userId;
      this.userName = options.userName;
    }
  }

  public extend(options: Partial<ContextData>): Context {
    const ctx = new Context(this);
    if (options.session) {
      ctx.session = new Session(options.session);
    }
    return ctx;
  }

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
