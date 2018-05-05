export interface ContextOptions {
  roomId: string;
  threadId: string;
  userId: string;
  userName: string;
}

export class Context implements ContextOptions {
  public readonly roomId: string;
  public readonly threadId: string;
  public readonly userId: string;
  public readonly userName: string;

  constructor(options: ContextOptions) {
    this.roomId = options.roomId;
    this.threadId = options.threadId;
    this.userId = options.userId;
    this.userName = options.userName;
  }
}
