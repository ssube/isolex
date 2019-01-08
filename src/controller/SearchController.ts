import { Inject } from 'noicejs';

import { INJECT_REQUEST, INJECT_TEMPLATE } from 'src/BaseService';
import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { mustExist } from 'src/utils';
import { RequestFactory } from 'src/utils/Request';
import { Template } from 'src/utils/Template';

export interface SearchControllerData extends ControllerData {
  count: number;
  field: string;
  request: {
    method: string;
    url: string;
  };
}

export type SearchControllerOptions = BaseControllerOptions<SearchControllerData>;

export const NOUN_SEARCH = 'search';

@Inject(INJECT_TEMPLATE, INJECT_REQUEST)
export class SearchController extends BaseController<SearchControllerData> implements Controller {
  protected readonly request: RequestFactory;
  protected readonly url: Template;

  constructor(options: SearchControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-search', [NOUN_SEARCH]);

    this.request = mustExist(options[INJECT_REQUEST]);
    this.url = mustExist(options[INJECT_TEMPLATE]).compile(options.data.request.url);
  }

  @Handler(NOUN_SEARCH, CommandVerb.Get)
  @CheckRBAC()
  public async getSearch(cmd: Command, ctx: Context): Promise<void> {
    const data = cmd.get(this.data.field);
    if (data.length === 0) {
      return this.reply(ctx, 'no arguments were provided!');
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

  @Handler(NOUN_SEARCH, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}
