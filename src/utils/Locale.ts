import i18next from 'i18next';
import { ServiceLifecycle } from 'src/Service';
import { mustExist } from 'src/utils';

export interface LocaleOptions {
  lang: string;
}

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
        en: {
          translation: {
            error: {
              grant: {
                missing: 'permission denied',
              },
              session: {
                missing: 'must be logged in',
              },
            },
          },
        },
      },
    });
  }

  public async stop() {
    /* noop */
  }

  public translate(key: string, options: i18next.TranslationOptions = {}): string {
    const t = mustExist(this.translator);
    return t(key, options);
  }
}
