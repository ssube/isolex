import { mustExist } from '@apextoaster/js-utils';
import { LogLevel as SlackLevel } from '@slack/logger';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { classLogger } from '.';
import { INJECT_LOGGER } from '../BaseService';

export interface SlackLoggerOptions extends BaseOptions {
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOGGER)
export class SlackLogger {
  protected level: SlackLevel;
  protected readonly logger: Logger;

  constructor(options: SlackLoggerOptions) {
    this.level = SlackLevel.INFO;
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

  public getLevel(): SlackLevel {
    return this.level;
  }

  public setLevel(level: SlackLevel) {
    this.level = level;
  }

  public setName(name: string) {
    /* noop */
  }
}
