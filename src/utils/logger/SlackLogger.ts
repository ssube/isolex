import { Logger, LogLevel } from 'noicejs';

export interface SlackLoggerOptions {
  logger: Logger;
}

export class SlackLogger {
  private readonly logger: Logger;

  constructor(options: SlackLoggerOptions) {
    this.logger = options.logger;
  }

  public debug(...msg: Array<string>) {
    this.logger.debug({ inner: msg }, 'slack client logged debug');
  }

  public error(...msg: Array<string>) {
    this.logger.error({ inner: msg }, 'slack client logged error');
  }

  public info(...msg: Array<string>) {
    this.logger.info({ inner: msg }, 'slack client logged info');
  }

  public warn(...msg: Array<string>) {
    this.logger.warn({ inner: msg }, 'slack client logged warn');
  }

  public setLevel(level: LogLevel) {
    /* noop */
  }

  public setName(name: string) {
    /* noop */
  }
}
