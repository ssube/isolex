import { isNumber, isString } from 'lodash';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Message } from 'src/Message';

export interface UserFilterConfig {
  ignore: Array<number | string>;
}

export interface UserFilterOptions {
  bot: Bot;
  config: UserFilterConfig;
  logger: Logger;
}

export class UserFilter implements Filter {
  protected ignore: Array<number | string>;
  protected logger: Logger;

  constructor(options: UserFilterOptions) {
    this.ignore = options.config.ignore;
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
