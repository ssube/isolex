import i18next from 'i18next';
import { Container, Inject, Logger } from 'noicejs';

import { BaseService, BaseServiceOptions, INJECT_LOGGER } from '../BaseService';
import { ServiceLifecycle } from '../Service';
import { mustExist } from '../utils';
import { classLogger } from '../utils/logger';
import { LocaleLogger } from '../utils/logger/LocaleLogger';
import * as LOCALE_GLOBAL from './en.yml';

export interface LocaleData {
  lang: string;
}

export interface LocaleOptions extends BaseServiceOptions<LocaleData> {
  [INJECT_LOGGER]: Logger;
  data: LocaleData;
}

export type TranslateOptions = i18next.TOptions;

@Inject(INJECT_LOGGER)
export class Locale extends BaseService<LocaleData> implements ServiceLifecycle {
  protected readonly container: Container;
  protected readonly data: LocaleData;
  protected readonly logger: Logger;

  protected translator?: i18next.TFunction;

  constructor(options: LocaleOptions) {
    super(options, 'isolex#/definitions/service-locale');

    this.container = options.container;
    this.data = options.data;
    this.logger = classLogger(options[INJECT_LOGGER], Locale);
  }

  public async start() {
    const logger = await this.container.create(LocaleLogger, {
      logger: this.logger,
    });
    this.translator = await i18next.use(logger).init({
      debug: true,
      lng: this.data.lang,
      resources: {
        en: LOCALE_GLOBAL,
      },
    });
  }

  public async stop() {
    /* noop */
  }

  public get lang(): string {
    return this.data.lang;
  }

  public translate(key: string, options: TranslateOptions = {}): string {
    const t = mustExist(this.translator);
    return t(key, options);
  }
}
