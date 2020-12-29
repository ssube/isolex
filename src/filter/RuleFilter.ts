import { Filter, FilterBehavior, FilterData, FilterValue } from '.';
import { MatchData, MatchRules } from '../utils/MatchRules';
import { BaseFilter, BaseFilterOptions } from './BaseFilter';

export interface RuleFilterData extends FilterData {
  match: MatchData;
}

export abstract class RuleFilter extends BaseFilter<RuleFilterData> implements Filter {
  protected matcher: MatchRules;

  constructor(options: BaseFilterOptions<RuleFilterData>, schemaPath: string) {
    super(options, schemaPath);

    this.matcher = new MatchRules(options.data.match);
  }

  public abstract check(value: FilterValue): Promise<FilterBehavior>;
}
