import { makeDict } from '@apextoaster/js-utils';

import { FilterBehavior, FilterValue } from '.';
import { Message } from '../entity/Message';
import { BaseFilterOptions } from './BaseFilter';
import { RuleFilter, RuleFilterData } from './RuleFilter';

export type MessageFilterData = RuleFilterData;

/**
 * Simple filter for messages.
 *
 * Supports:
 * - type
 */
export class MessageFilter extends RuleFilter {
  constructor(options: BaseFilterOptions<RuleFilterData>) {
    super(options, 'isolex#/definitions/service-filter-message');
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    if (Message.isMessage(value)) {
      const result = this.matcher.match({
        labels: makeDict(value.labels),
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
