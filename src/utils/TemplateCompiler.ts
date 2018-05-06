import * as Handlebars from 'handlebars';
import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Context } from 'src/Context';
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
      class: TemplateCompiler.name
    });
    this.options = {};

    this.compiler.registerHelper('entries', this.formatEntries.bind(this));
    this.compiler.registerHelper('json', this.formatJSON.bind(this));
    this.compiler.registerHelper('reply', this.formatDestination.bind(this));
  }

  public compile(body: string): Template {
    return new Template({
      template: this.compiler.compile(body, this.options)
    });
  }

  public formatDestination(context: Context): string {
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

  public formatJSON(value: object): string {
    return JSON.stringify(value);
  }
}
