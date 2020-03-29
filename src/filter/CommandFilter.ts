import { makeDict } from '@apextoaster/js-utils';

import { FilterBehavior, FilterValue } from '.';
import { Command } from '../entity/Command';
import { BaseFilterOptions } from './BaseFilter';
import { RuleFilter, RuleFilterData } from './RuleFilter';

export type CommandFilterData = RuleFilterData;

/**
 * Simple filter for commands.
 *
 * Supports:
 * - labels
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
        labels: makeDict(value.labels),
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
