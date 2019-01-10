import i18next from 'i18next';
import { Container, Inject, Logger } from 'noicejs';

import { BaseService, BaseServiceOptions, INJECT_LOGGER } from 'src/BaseService';
import { ServiceLifecycle } from 'src/Service';
import { mustExist } from 'src/utils';
import { classLogger } from 'src/utils/logger';
import { LocaleLogger } from 'src/utils/logger/LocaleLogger';

export interface LocaleData {
  lang: string;
}

export interface LocaleOptions extends BaseServiceOptions<LocaleData> {
  [INJECT_LOGGER]: Logger;
  data: LocaleData;
}

export type TranslateOptions = i18next.TranslationOptions;

@Inject(INJECT_LOGGER)
export class Locale extends BaseService<LocaleData> implements ServiceLifecycle {
  protected readonly container: Container;
  protected readonly data: LocaleData;
  protected readonly logger: Logger;

  protected translator?: i18next.TranslationFunction;

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
        /* tslint:disable:no-var-requires */
        en: require('src/locale/en.yml'),
        /* tslint:enable:no-var-requires */
      },
    });
  }

  public async stop() {
    /* noop */
  }

  public translate(key: string, options: TranslateOptions = {}): string {
    const t = mustExist(this.translator);
    return t(key, options);
  }
}
