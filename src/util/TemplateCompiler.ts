import * as Handlebars from 'handlebars';

import { Context } from 'src/Context';
import { Template } from 'src/util/Template';

export interface TemplateCompilerOptions {

}

export class TemplateCompiler {
  protected compiler: typeof Handlebars;
  protected options: CompileOptions;

  constructor(options: TemplateCompilerOptions) {
    this.compiler = Handlebars.create();
    this.options = {};

    this.compiler.registerHelper('reply', formatDestination);
  }

  public compile(body: string): Template {
    return new Template({
      template: this.compiler.compile(body, this.options)
    });
  }
}

function formatDestination(context: Context): string {
  return `@${context.userName}`;
}
