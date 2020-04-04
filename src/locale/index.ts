import { mustExist } from '@apextoaster/js-utils';
import i18n, { ResourceLanguage, TFunction, TOptions } from 'i18next';
import { Container, Inject } from 'noicejs';

import { BaseService, BaseServiceData, BaseServiceOptions } from '../BaseService';
import { LocaleLogger } from '../logger/LocaleLogger';
import { ServiceLifecycle } from '../Service';
import * as LOCALE_GLOBAL from './en.yml';

export const INJECT_LOCALE_LOGGER = Symbol('inject-locale-logger');

export interface LocaleData extends BaseServiceData {
  lang: string;
}

export interface LocaleOptions extends BaseServiceOptions<LocaleData> {
  data: LocaleData;
  [INJECT_LOCALE_LOGGER]?: LocaleLogger;
}

export type TranslateOptions = TOptions;

@Inject({
  contract: LocaleLogger,
  name: INJECT_LOCALE_LOGGER,
})
export class Locale extends BaseService<LocaleData> implements ServiceLifecycle {
  protected readonly container: Container;
  protected readonly data: LocaleData;
  protected readonly localeLogger: LocaleLogger;

  protected translator?: TFunction;

  constructor(options: LocaleOptions) {
    super(options, 'isolex#/definitions/service-locale');

    this.container = options.container;
    this.data = options.data;
    this.localeLogger = mustExist(options[INJECT_LOCALE_LOGGER]);
  }

  public async start() {
    this.translator = await i18n.use(this.localeLogger).init({
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
