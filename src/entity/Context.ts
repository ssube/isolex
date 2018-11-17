import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ContextOptions {
  listenerId: string;
  roomId: string;
  threadId: string;
  userId: string;
  userName: string;
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

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public listenerId: string;

  @Column()
  public roomId: string;

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
