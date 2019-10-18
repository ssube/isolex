import Handlebars from 'handlebars';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { INJECT_LOGGER } from '../BaseService';
import { Context } from '../entity/Context';
import { classLogger } from '../logger';
import { Dict, entriesOf, MapLike, mustGet } from './Map';
import { trim } from './String';
import { Template } from './Template';

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

    this.compiler.registerHelper('entries', this.formatEntries.bind(this));
    this.compiler.registerHelper('json', this.formatJSON.bind(this));
    this.compiler.registerHelper('key', this.getKey.bind(this));
    this.compiler.registerHelper('reply', this.formatContext.bind(this));
    this.compiler.registerHelper('trim', this.formatTrim.bind(this));
    this.compiler.registerHelper('withMap', this.withMap.bind(this));
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
    for (const [key, value] of this.entriesOf(map)) {
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
    return trim(value, max, tail);
  }

  public getKey(map: Map<string, unknown>, key: string): unknown {
    this.logger.debug({ key, map }, 'getting key for template');
    return mustGet(map, key);
  }

  public withMap(context: Map<string, unknown>, options: Handlebars.HelperOptions): string {
    const args: Dict<unknown> = {};
    for (const [key, src] of Object.entries(options.hash as Dict<string>)) {
      this.logger.debug({ key, context }, 'getting key for template');
      const val = mustGet(context, src);
      args[key] = val;
    }
    return options.fn(args);
  }

  protected entriesOf(map: MapLike<string>): Array<[string, string]> {
    return entriesOf(map);
  }
}
