import { BaseFilter } from 'src/filter/BaseFilter';
import { Filter, FilterBehavior, FilterData, FilterOptions, FilterValue } from 'src/filter/Filter';
import { Match, MatchData } from 'src/utils/match';

export interface RuleFilterData extends FilterData {
  match: MatchData;
}

export abstract class RuleFilter extends BaseFilter<RuleFilterData> implements Filter {
  protected matcher: Match;

  constructor(options: FilterOptions<RuleFilterData>, schemaPath: string) {
    super(options, schemaPath);

    this.matcher = new Match(options.data.match);
  }

  public abstract async check(value: FilterValue): Promise<FilterBehavior>;
}
