import { Command } from 'src/entity/Command';
import { mapToDict } from 'src/utils/Map';

import { FilterBehavior, FilterValue } from './Filter';
import { RuleFilter } from './RuleFilter';

/**
 * Simple filter for commands.
 *
 * Supports:
 * - noun
 * - verb
 */
export class CommandFilter extends RuleFilter {
  public async check(value: FilterValue): Promise<FilterBehavior> {
    if (Command.isCommand(value)) {
      const result = this.matcher.match({
        labels: mapToDict(value.labels),
        noun: value.noun,
        verb: value.verb,
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
