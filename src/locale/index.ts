import i18next from 'i18next';
import { kebabCase } from 'lodash';
import { Container, Inject, Logger } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';

import { INJECT_LOGGER } from 'src/BaseService';
import { ServiceLifecycle } from 'src/Service';
import { mustExist } from 'src/utils';
import { LocaleLogger } from 'src/utils/LocaleLogger';

export interface LocaleOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
  lang: string;
}

export type TranslateOptions = i18next.TranslationOptions;

@Inject(INJECT_LOGGER)
export class Locale implements ServiceLifecycle {
  protected readonly container: Container;
  protected readonly lang: string;
  protected readonly logger: Logger;
  protected translator?: i18next.TranslationFunction;

  constructor(options: LocaleOptions) {
    this.container = options.container;
    this.lang = options.lang;
    this.logger = options[INJECT_LOGGER].child({
      kind: kebabCase(Locale.name),
    });
  }

  public async start() {
    const logger = await this.container.create(LocaleLogger, {
      logger: this.logger,
    });
    this.translator = await i18next.use(logger).init({
      debug: true,
      lng: this.lang,
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
