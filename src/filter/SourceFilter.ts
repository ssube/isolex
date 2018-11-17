import { BaseFilter } from './BaseFilter';
import { Filter, FilterValue, FilterBehavior } from './Filter';
import { ServiceConfig } from 'src/Service';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';

export type SourceFilterConfig = ServiceConfig;

export class SourceFilter extends BaseFilter<ServiceConfig> implements Filter {
  protected type?: string;

  public async filter(value: FilterValue): Promise<FilterBehavior> {
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