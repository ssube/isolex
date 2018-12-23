import { BotService } from 'src/ChildService';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';

/**
 * Most filters are stateless, this implements methods for them.
 */
export abstract class BaseFilter<TData> extends BotService<TData> implements Filter {
  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public abstract check(val: FilterValue): Promise<FilterBehavior>;
}
