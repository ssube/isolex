import { BaseFilter } from 'src/filter/BaseFilter';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { ServiceConfig, ServiceOptions } from 'src/Service';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';

export type UserFilterConfig = ChecklistOptions & ServiceConfig;

export type UserFilterOptions = ServiceOptions<UserFilterConfig>;

export class UserFilter extends BaseFilter<UserFilterConfig> implements Filter {
  protected check: Checklist;

  constructor(options: UserFilterOptions) {
    super(options);

    this.check = new Checklist(options.config);
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
