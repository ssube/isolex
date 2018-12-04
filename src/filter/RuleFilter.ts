import { Match, MatchData } from 'src/utils/match';

import { BaseFilter } from './BaseFilter';
import { Filter, FilterBehavior, FilterOptions, FilterValue } from './Filter';

export interface RuleFilterData {
  match: MatchData;
}

export abstract class RuleFilter extends BaseFilter<RuleFilterData> implements Filter {
  protected matcher: Match;

  constructor(options: FilterOptions<RuleFilterData>) {
    super(options);

    this.matcher = new Match(options.data.match);
  }

  public abstract async filter(value: FilterValue): Promise<FilterBehavior>;
}
