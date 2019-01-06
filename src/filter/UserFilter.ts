import { BotServiceOptions } from 'src/BotService';
import { BaseFilter } from 'src/filter/BaseFilter';
import { Filter, FilterBehavior, FilterData, FilterValue } from 'src/filter/Filter';
import { mustExist } from 'src/utils';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';

export interface UserFilterData extends FilterData {
  users: ChecklistOptions<string>;
}

export type UserFilterOptions = BotServiceOptions<UserFilterData>;

export class UserFilter extends BaseFilter<UserFilterData> implements Filter {
  protected list: Checklist<string>;

  constructor(options: UserFilterOptions) {
    super(options, 'isolex#/definitions/service-filter-user');

    this.list = new Checklist(options.data.users);
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    const context = mustExist(value.context);

    if (!this.list.check(context.uid)) {
      this.logger.debug({ context }, 'filter ignoring user id');
      return FilterBehavior.Drop;
    }

    if (!this.list.check(context.name)) {
      this.logger.debug({ context }, 'filter ignoring user name');
      return FilterBehavior.Drop;
    }

    return FilterBehavior.Allow;
  }
}
