import i18next, { ResourceLanguage } from 'i18next';
import { Container } from 'noicejs';

import { BaseService, BaseServiceOptions } from '../BaseService';
import { ServiceLifecycle } from '../Service';
import { mustExist } from '../utils';
import { LocaleLogger } from '../utils/logger/LocaleLogger';
import * as LOCALE_GLOBAL from './en.yml';

export interface LocaleData {
  lang: string;
}

export interface LocaleOptions extends BaseServiceOptions<LocaleData> {
  data: LocaleData;
}

export type TranslateOptions = i18next.TOptions;

export class Locale extends BaseService<LocaleData> implements ServiceLifecycle {
  protected readonly container: Container;
  protected readonly data: LocaleData;

  protected translator?: i18next.TFunction;

  constructor(options: LocaleOptions) {
    super(options, 'isolex#/definitions/service-locale');

    this.container = options.container;
    this.data = options.data;
  }

  public async start() {
    const logger = await this.container.create(LocaleLogger);
    this.translator = await i18next.use(logger).init({
      debug: true,
      lng: this.data.lang,
      resources: {
        en: LOCALE_GLOBAL as ResourceLanguage,
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
    this.logger.debug({ key, options }, 'translating key');
    const t = mustExist(this.translator);
    return t(key, options);
  }
}
