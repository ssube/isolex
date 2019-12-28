import { Filter, FilterBehavior, FilterData, FilterValue } from '.';
import { BotService, BotServiceOptions } from '../BotService';

export type BaseFilterOptions<TData extends FilterData> = BotServiceOptions<TData>;

/**
 * Most filters are stateless, this implements methods for them.
 */
export abstract class BaseFilter<TData extends FilterData> extends BotService<TData> implements Filter {
  /* eslint-disable-next-line no-useless-constructor */
  constructor(options: BaseFilterOptions<TData>, schemaPath: string) {
    super(options, schemaPath);
  }

  public abstract check(val: FilterValue): Promise<FilterBehavior>;
}
