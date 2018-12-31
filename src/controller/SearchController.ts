import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { RequestFactory } from 'src/utils/Request';
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

export const NOUN_SEARCH = 'search';

@Inject('compiler', 'request')
export class SearchController extends BaseController<SearchControllerData> implements Controller {
  protected readonly request: RequestFactory;
  protected readonly url: Template;

  constructor(options: SearchControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-search', [NOUN_SEARCH]);

    this.request = options.request;
    this.url = options.compiler.compile(options.data.request.url);
  }

  public async handle(cmd: Command): Promise<void> {
    const data = cmd.get(this.data.field);
    if (!data.length) {
      return this.reply(cmd.context, 'no arguments were provided!');
    }

    const requestUrl = this.url.render({ data });
    this.logger.debug({ requestUrl }, 'searching at url');

    const response = await this.request.create({
      json: true,
      method: this.data.request.method,
      uri: requestUrl,
    });

    return this.transformJSON(cmd, response);
  }
}
