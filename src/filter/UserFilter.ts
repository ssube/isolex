import * as bunyan from 'bunyan';
import { isNumber, isString } from 'lodash';
import { Bot } from 'src/Bot';
import { Command } from 'src/command/Command';
import { Destination } from 'src/Destination';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Message } from 'src/Message';
import { getEventDest } from 'src/utils';

export interface UserFilterConfig {
  ignore: Array<number | string>;
}

export interface UserFilterOptions {
  bot: Bot;
  config: UserFilterConfig;
  logger: bunyan;
}

export class UserFilter implements Filter {
  protected ignore: Array<number | string>;

  constructor(options: UserFilterOptions) {
    this.ignore = options.config.ignore;
  }

  public getUser(val: FilterValue): Destination {
    if (val instanceof Command) {
      return val.from;
    } else if (val instanceof Message) {
      return val.dest;
    } else {
      return getEventDest(val);
    }
  }

  public async filter(val: FilterValue): Promise<FilterBehavior> {
    const user = this.getUser(val);

    for (const i of this.ignore) {
      if (user.userId === i || user.userName === i) {
        return FilterBehavior.Drop;
      }
    }

    return FilterBehavior.Allow;
  }
}
