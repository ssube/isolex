import * as Handlebars from 'handlebars';
import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Context } from 'src/entity/Context';
import { Template } from 'src/utils/Template';

export interface TemplateCompilerOptions {
  logger: Logger;
}

@Inject('logger')
export class TemplateCompiler {
  protected compiler: typeof Handlebars;
  protected logger: Logger;
  protected options: CompileOptions;

  constructor(options: TemplateCompilerOptions) {
    this.compiler = Handlebars.create();
    this.logger = options.logger.child({
      class: TemplateCompiler.name,
    });
    this.options = {};

    this.compiler.registerHelper('trim', this.formatTrim.bind(this));
    this.compiler.registerHelper('entries', this.formatEntries.bind(this));
    this.compiler.registerHelper('json', this.formatJSON.bind(this));
    this.compiler.registerHelper('reply', this.formatContext.bind(this));
  }

  public compile(body: string): Template {
    return new Template({
      template: this.compiler.compile(body, this.options),
    });
  }

  /**
   * @TODO: move this to each Listener
   */
  public formatContext(context: Context): string {
    return `@${context.userName}`;
  }

  public formatEntries(map: Map<string, string>, block: any): string {
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
   * @TODO: handle max < 3
   */
  public formatTrim(value: string, max: number = 10): string {
    if (value.length <= max) {
      return value;
    }

    const start = value.substr(0, max - 3);
    return `${start}...`;
  }
}
