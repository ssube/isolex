export interface TemplateOptions {
  template: HandlebarsTemplateDelegate;
}

export class Template {
  protected template: HandlebarsTemplateDelegate;

  constructor(options: TemplateOptions) {
    this.template = options.template;
  }

  public render(data: unknown): string {
    return this.template(data);
  }
}
