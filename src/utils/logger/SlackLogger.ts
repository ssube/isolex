import { Logger, LogLevel } from "noicejs";

export interface SlackLoggerOptions {
  logger: Logger;
}

export class SlackLogger {
  private readonly logger: Logger;

  constructor(options: SlackLoggerOptions) {
    this.logger = options.logger;
  }

  public debug(...msg: Array<string>) {
    this.logger.debug('slack client logged', { msg });
  }

  public error(...msg: Array<string>) {
    this.logger.error('slack client logged', { msg });
  }

  public info(...msg: Array<string>) {
    this.logger.info('slack client logged', { msg });
  }

  public warn(...msg: Array<string>) {
    this.logger.warn('slack client logged', { msg });
  }

  public setLevel(level: LogLevel) {
    /* noop */
  }

  public setName(name: string) {
    /* noop */
  }
}