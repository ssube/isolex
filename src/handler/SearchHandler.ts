import * as jp from 'jsonpath';
import * as mathjs from 'mathjs';
import { Container, Inject } from 'noicejs';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface SearchHandlerConfig extends HandlerConfig {
  count: number;
  field: string;
  filter: string;
  method: string;
  template: {
    body: string;
    url: string;
  }
}

export interface SearchHandlerOptions extends HandlerOptions<SearchHandlerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class SearchHandler extends BaseHandler<SearchHandlerConfig> implements Handler {
  protected body: Template;
  protected container: Container;
  protected url: Template;

  constructor(options: SearchHandlerOptions) {
    super(options);

    this.body = options.compiler.compile(options.config.template.body);
    this.container = options.container;
    this.url = options.compiler.compile(options.config.template.url);
  }

  public async handle(cmd: Command): Promise<void> {
    const args = cmd.data.get(this.config.field);
    if (!args || !args.length) {
      throw new Error('no arguments were provided!');
    }

    const requestUrl = this.url.render({ data: args });
    this.logger.debug({ requestUrl }, 'searching at url');

    const response = await this.container.create<any, any>('request', {
      json: true,
      method: this.config.method,
      uri: requestUrl
    });

    const data = await jp.query(response, this.config.filter, this.config.count);
    this.logger.debug({ data }, 'rendering request data');

    if (!data.length) {
      throw new Error('filter did not match response');
    }

    const body = this.body.render({ data });

    return this.bot.send(Message.reply(body, cmd.context));
  }
}
