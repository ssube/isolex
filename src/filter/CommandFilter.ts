import { RuleFilter } from './RuleFilter';
import { FilterValue, FilterBehavior } from './Filter';
import { Command } from 'src/entity/Command';
import { mapToDict } from 'src/utils';

/**
 * Simple filter for commands.
 *
 * Supports:
 * - noun
 * - verb
 */
export class CommandFilter extends RuleFilter {
  public async filter(value: FilterValue): Promise<FilterBehavior> {
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