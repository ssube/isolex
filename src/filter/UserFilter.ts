import { isNumber, isString } from 'lodash';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { BaseFilter } from 'src/filter/BaseFilter';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Message } from 'src/Message';
import { ServiceOptions } from 'src/Service';

export interface UserFilterConfig {
  ignore: Array<string>;
}

export type UserFilterOptions = ServiceOptions<UserFilterConfig>;

export class UserFilter extends BaseFilter<UserFilterConfig> implements Filter {
  protected ignore: Array<string>;

  constructor(options: UserFilterOptions) {
    super(options);

    this.ignore = options.config.ignore;
  }

  public getIgnore(): Array<string> {
    return this.ignore;
  }

  public async filter(value: FilterValue): Promise<FilterBehavior> {
    const context = value.context;
    for (const ignore of this.ignore) {
      if (context.userId === ignore || context.userName === ignore) {
        this.logger.debug({ context, ignore }, 'filter is ignoring context');
        return FilterBehavior.Drop;
      }
    }

    return FilterBehavior.Allow;
  }
}
