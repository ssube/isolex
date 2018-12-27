import { Message } from 'src/entity/Message';
import { FilterBehavior, FilterOptions, FilterValue } from 'src/filter/Filter';
import { RuleFilter, RuleFilterData } from 'src/filter/RuleFilter';

/**
 * Simple filter for messages.
 *
 * Supports:
 * - type
 */
export class MessageFilter extends RuleFilter {
  constructor(options: FilterOptions<RuleFilterData>) {
    super(options, 'isolex#/definitions/service-filter-message');
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    if (Message.isMessage(value)) {
      const result = this.matcher.match({
        type: value.type,
      });

      if (result.matched) {
        return FilterBehavior.Allow;
      } else {
        this.logger.debug({ rules: result.errors, value }, 'match failed on rules');
        return FilterBehavior.Drop;
      }
    }

    return FilterBehavior.Ignore;
  }
}
