import { Logger } from 'noicejs/logger/Logger';
import { BaseService } from 'src/BaseService';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { ServiceConfig } from 'src/Service';

/**
 * Most filters are stateless, this implements methods for them.
 */
export abstract class BaseFilter<TConfig extends ServiceConfig> extends BaseService<TConfig> implements Filter {
  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public abstract filter(val: FilterValue): Promise<FilterBehavior>;
}
