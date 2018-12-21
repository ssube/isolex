import { Message } from 'src/entity/Message';

import { BaseFilter } from './BaseFilter';
import { Filter, FilterBehavior, FilterOptions, FilterValue } from './Filter';

export interface SourceFilterData {
  type?: string;
}

export class SourceFilter extends BaseFilter<SourceFilterData> implements Filter, SourceFilterData {
  public readonly type?: string;

  constructor(options: FilterOptions<SourceFilterData>) {
    super(options, 'isolex#/definitions/service-filter-source');
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    if (Message.isMessage(value)) {
      return this.filterMessage(value);
    }

    return FilterBehavior.Ignore;
  }

  public async filterMessage(msg: Message): Promise<FilterBehavior> {
    if (this.type && msg.type !== this.type) {
      return FilterBehavior.Drop;
    }

    return FilterBehavior.Allow;
  }
}
