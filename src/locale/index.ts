import i18next from 'i18next';
import { kebabCase } from 'lodash';
import { Inject, Logger } from 'noicejs';

import { INJECT_LOGGER } from 'src/BaseService';
import { ServiceLifecycle } from 'src/Service';
import { mustExist } from 'src/utils';

export interface LocaleOptions {
  [INJECT_LOGGER]: Logger;
  lang: string;
}

export type TranslateOptions = i18next.TranslationOptions;

@Inject(INJECT_LOGGER)
export class Locale implements ServiceLifecycle {
  protected readonly lang: string;
  protected readonly logger: Logger;
  protected translator?: i18next.TranslationFunction;

  constructor(options: LocaleOptions) {
    this.lang = options.lang;
    this.logger = options[INJECT_LOGGER].child({
      kind: kebabCase(Locale.name),
    });
  }

  public async start() {
    this.translator = await i18next.use({
      type: 'logger',
      log: (args: Array<unknown>) => this.logger.debug({ args }, 'message from locale'),
      warn: (args: Array<unknown>) => this.logger.warn({ args }, 'warning from locale'),
      error: (args: Array<unknown>) => this.logger.error({ args }, 'error from locale'),
    }).init({
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
