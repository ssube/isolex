import { Command } from 'src/entity/Command';
import { FilterBehavior, FilterValue } from 'src/filter';
import { BaseFilterOptions } from 'src/filter/BaseFilter';
import { RuleFilter, RuleFilterData } from 'src/filter/RuleFilter';
import { mapToDict } from 'src/utils/Map';

export type CommandFilterData = RuleFilterData;

/**
 * Simple filter for commands.
 *
 * Supports:
 * - noun
 * - verb
 */
export class CommandFilter extends RuleFilter {
  constructor(options: BaseFilterOptions<CommandFilterData>) {
    super(options, 'isolex#/definitions/service-filter-command');
  }

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
