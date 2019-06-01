import * as Handlebars from 'handlebars';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { INJECT_LOGGER } from 'src/BaseService';
import { Context } from 'src/entity/Context';
import { mustExist } from 'src/utils';
import { classLogger } from 'src/utils/logger';
import { Template } from 'src/utils/Template';

export interface TemplateCompilerOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
}

@Inject(INJECT_LOGGER)
export class TemplateCompiler {
  protected compiler: typeof Handlebars;
  protected logger: Logger;
  protected options: CompileOptions;

  constructor(options: TemplateCompilerOptions) {
    this.compiler = Handlebars.create();
    this.logger = classLogger(options[INJECT_LOGGER], TemplateCompiler);
    this.options = {};

    this.compiler.registerHelper('trim', this.formatTrim.bind(this));
    this.compiler.registerHelper('entries', this.formatEntries.bind(this));
    this.compiler.registerHelper('json', this.formatJSON.bind(this));
    this.compiler.registerHelper('key', this.getKey.bind(this));
    this.compiler.registerHelper('reply', this.formatContext.bind(this));
  }

  public compile(body: string): Template {
    return new Template({
      template: this.compiler.compile(body, this.options),
    });
  }

  public formatContext(context: Context): string {
    return `@${context.name}`;
  }

  public formatEntries(map: Map<string, string>, block: Handlebars.HelperOptions): string {
    this.logger.debug({ block, map, type: typeof map }, 'formatting map entries');

    const parts = [];
    for (const [key, value] of map.entries()) {
      parts.push(block.fn({ key, value }));
    }
    return parts.join('');
  }

  public formatJSON(value: object): hbs.SafeString {
    return new Handlebars.SafeString(JSON.stringify(value));
  }

  /**
   * Trim the value and add ellipsis if possible.
   */
  public formatTrim(value: string, max: number = 10, tail = '...'): string {
    this.logger.debug({ max, tail, value }, 'trimming string');

    if (value.length <= max) {
      return value;
    }

    if (max < tail.length) {
      return value.substr(0, max);
    }

    const start = value.substr(0, max - tail.length);
    return `${start}${tail}`;
  }

  public getKey(map: Map<string, unknown>, key: string): unknown {
    this.logger.debug({ key, map }, 'getting key for template');
    return mustExist(map.get(key));
  }
}
