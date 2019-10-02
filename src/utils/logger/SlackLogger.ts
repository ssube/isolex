import { BaseOptions, Inject, Logger, LogLevel } from 'noicejs';

import { classLogger } from '.';
import { mustExist } from '..';
import { INJECT_LOGGER } from '../../BaseService';

export interface SlackLoggerOptions extends BaseOptions {
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOGGER)
export class SlackLogger {
  private readonly logger: Logger;

  constructor(options: SlackLoggerOptions) {
    this.logger = classLogger(mustExist(options[INJECT_LOGGER]), SlackLogger);
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
