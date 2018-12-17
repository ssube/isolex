const NOW_TO_SECONDS = 1000;

export class Clock {
  protected date: DateConstructor;

  constructor(date = Date) {
    this.date = date;
  }

  public getSeconds(): number {
    return this.date.now() / NOW_TO_SECONDS;
  }
}
