export class Destination {
  public readonly roomId: string;
  public readonly userId: string;
  public readonly userName: string;

  constructor(options: any) {
    this.roomId = options.roomId;
    this.userId = options.userId;
    this.userName = options.userName;
  }
}