import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export interface ContextOptions {
  roomId: string;
  threadId: string;
  userId: string;
  userName: string;
  listenerId: string;
}

@Entity()
export class Context implements ContextOptions {
  public static create(options: ContextOptions) {
    const ctx = new Context();
    ctx.roomId = options.roomId;
    ctx.threadId = options.threadId;
    ctx.userId = options.userId;
    ctx.userName = options.userName;
    ctx.listenerId = options.listenerId;
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
}
