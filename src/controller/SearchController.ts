import { Container, Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_JSON } from 'src/utils/Mime';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface SearchControllerData extends ControllerData {
  count: number;
  field: string;
  request: {
    method: string;
    url: string;
  };
}

export interface SearchControllerOptions extends ControllerOptions<SearchControllerData> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class SearchController extends BaseController<SearchControllerData> implements Controller {
  protected container: Container;
  protected url: Template;

  constructor(options: SearchControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-search');

    this.container = options.container;
    this.url = options.compiler.compile(options.data.request.url);
  }

  public async handle(cmd: Command): Promise<void> {
    const args = cmd.data.get(this.data.field);
    if (!args || !args.length) {
      return this.reply(cmd.context, 'no arguments were provided!');
    }

    const requestUrl = this.url.render({ data: args });
    this.logger.debug({ requestUrl }, 'searching at url');

    const response = await this.container.create<any, any>('request', {
      json: true,
      method: this.data.request.method,
      uri: requestUrl,
    });

    const body = JSON.stringify(response);
    const messages = await this.transform(cmd, Message.reply(cmd.context, TYPE_JSON, body));
    this.logger.debug({ count: messages.length }, 'transformed search result into message');
    for (const msg of messages) {
      await this.bot.sendMessage(msg);
    }
  }
}
