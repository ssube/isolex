import { mustExist } from '@apextoaster/js-utils';
import { LoggerModule } from 'i18next';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { classLogger } from '.';
import { INJECT_LOGGER } from '../BaseService';

export interface LocaleLoggerOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
}

@Inject(INJECT_LOGGER)
export class LocaleLogger implements LoggerModule {
  public readonly type = 'logger';

  protected logger: Logger;

  constructor(options: LocaleLoggerOptions) {
    this.logger = classLogger(mustExist(options[INJECT_LOGGER]), LocaleLogger);
  }

  public error(args: Array<unknown>) {
    this.logger.error({ args }, 'error from locale');
  }

  public log(args: Array<unknown>) {
    this.logger.debug({ args }, 'message from locale');
  }

  public warn(args: Array<unknown>) {
    this.logger.warn({ args }, 'warning from locale');
  }
}
