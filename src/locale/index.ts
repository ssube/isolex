import { mustExist } from '@apextoaster/js-utils';
import i18n, { ResourceLanguage, TFunction, TOptions } from 'i18next';
import { Container } from 'noicejs';

import { BaseService, BaseServiceData, BaseServiceOptions } from '../BaseService';
import { LocaleLogger } from '../logger/LocaleLogger';
import { ServiceLifecycle } from '../Service';
import * as LOCALE_GLOBAL from './en.yml';

export interface LocaleData extends BaseServiceData {
  lang: string;
}

export interface LocaleOptions extends BaseServiceOptions<LocaleData> {
  data: LocaleData;
}

export type TranslateOptions = TOptions;

export class Locale extends BaseService<LocaleData> implements ServiceLifecycle {
  protected readonly container: Container;
  protected readonly data: LocaleData;

  protected translator?: TFunction;

  constructor(options: LocaleOptions) {
    super(options, 'isolex#/definitions/service-locale');

    this.container = options.container;
    this.data = options.data;
  }

  public async start() {
    const logger = await this.container.create(LocaleLogger);
    this.translator = await i18n.use(logger).init({
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
