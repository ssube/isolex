import i18next from 'i18next';

import { ServiceLifecycle } from 'src/Service';
import { mustExist } from 'src/utils';

export interface LocaleOptions {
  lang: string;
}

export type TranslateOptions= i18next.TranslationOptions;

export class Locale implements ServiceLifecycle {
  protected readonly lang: string;
  protected translator?: i18next.TranslationFunction;

  constructor(options: LocaleOptions) {
    this.lang = options.lang;
  }

  public async start() {
    this.translator = await i18next.init({
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
