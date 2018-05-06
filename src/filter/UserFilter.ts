import { isNumber, isString } from 'lodash';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { BaseFilter } from 'src/filter/BaseFilter';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Message } from 'src/Message';
import { ServiceOptions } from 'src/Service';

export interface UserFilterConfig {
  ignore: Array<number | string>;
}

export type UserFilterOptions = ServiceOptions<UserFilterConfig>;

export class UserFilter extends BaseFilter<UserFilterConfig> implements Filter {
  protected ignore: Array<number | string>;

  constructor(options: UserFilterOptions) {
    super(options);

    this.ignore = options.config.ignore;
    this.logger = options.logger.child({
      class: UserFilter.name
    });
  }

  public async filter(val: FilterValue): Promise<FilterBehavior> {
    const user = val.context;
    for (const ignore of this.ignore) {
      if (user.userId === ignore || user.userName === ignore) {
        this.logger.debug({ignore, user}, 'filter is ignoring user');
        return FilterBehavior.Drop;
      }
    }

    return FilterBehavior.Allow;
  }
}
