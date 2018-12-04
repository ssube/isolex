import { Message } from 'src/entity/Message';

import { FilterBehavior, FilterValue } from './Filter';
import { RuleFilter } from './RuleFilter';

/**
 * Simple filter for messages.
 *
 * Supports:
 * - type
 */
export class MessageFilter extends RuleFilter {
  public async filter(value: FilterValue): Promise<FilterBehavior> {
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
