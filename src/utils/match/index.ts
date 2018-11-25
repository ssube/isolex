import { MapOrMapLike, mustGet, normalizeMap } from 'src/utils';

export interface MatchData {
  rules: Array<RuleData>;
}

export interface RuleData {
  key: string;
  negate?: boolean;
  operator: RuleOperator;
  values: Array<RuleValue>;
}

export enum RuleOperator {
  Every = 'every',
  Any = 'any',
}

export interface RuleValue {
  string?: string;
  regexp?: RegExp;
}

export class Match {
  protected rules: Array<RuleData>;

  constructor(options: MatchData) {
    this.rules = Array.from(options.rules);
  }

  public match(rawData: MapOrMapLike<string>): boolean {
    const data = normalizeMap(rawData);

    for (const rule of this.rules) {
      if (!data.has(rule.key)) {
        return false;
      }

      const value = mustGet(data, rule.key);
      if (!this.matchRule(rule, value)) {
        return false;
      }
    }

    return true;
  }

  public matchRule(rule: RuleData, value: string): boolean {
    switch (rule.operator) {
      case RuleOperator.Any:
        if (rule.negate) {
          return rule.values.some((it) => !this.matchValue(it, value));
        } else {
          return rule.values.some((it) => this.matchValue(it, value));
        }
      case RuleOperator.Every:
        if (rule.negate) {
          return rule.values.every((it) => !this.matchValue(it, value));
        } else {
          return rule.values.every((it) => this.matchValue(it, value));
        }
    }
  }

  public matchValue(ruleValue: RuleValue, value: string): boolean {
    if (ruleValue.string) {
      return ruleValue.string === value;
    }

    if (ruleValue.regexp) {
      return ruleValue.regexp.test(value);
    }

    return false;
  }
}