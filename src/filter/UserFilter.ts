import { ChildServiceOptions } from 'src/ChildService';
import { BaseFilter } from 'src/filter/BaseFilter';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';

export type UserFilterData = ChecklistOptions<string>;

export type UserFilterOptions = ChildServiceOptions<UserFilterData>;

export class UserFilter extends BaseFilter<UserFilterData> implements Filter {
  protected check: Checklist<string>;

  constructor(options: UserFilterOptions) {
    super(options);

    this.check = new Checklist(options.data);
  }

  public async filter(value: FilterValue): Promise<FilterBehavior> {
    const context = value.context;

    if (!this.check.check(context.userId)) {
      this.logger.debug({ context }, 'filter ignoring user id');
      return FilterBehavior.Drop;
    }

    if (!this.check.check(context.userName)) {
      this.logger.debug({ context }, 'filter ignoring user name');
      return FilterBehavior.Drop;
    }

    return FilterBehavior.Allow;
  }
}
