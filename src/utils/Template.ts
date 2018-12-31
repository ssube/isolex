export interface TemplateOptions {
  template: HandlebarsTemplateDelegate;
}

export type TemplateScope = object | string | Array<string>;

export class Template {
  protected template: HandlebarsTemplateDelegate;

  constructor(options: TemplateOptions) {
    this.template = options.template;
  }

  public render(data: TemplateScope): string {
    return this.template(data);
  }
}
