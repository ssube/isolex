import { get, has, isString } from 'lodash';

import { mapToDict } from 'src/utils/Map';

export interface MatchData {
  rules: Array<MatchRule>;
}

export interface MatchRule {
  key: string;
  negate?: boolean;
  operator: RuleOperator;
  values: Array<RuleValue>;
}

export enum RuleOperator {
  Any = 'any',
  Every = 'every',
  Never = 'never',
}

export interface RuleValue {
  string?: string;
  regexp?: RegExp;
}

export interface MatchResults {
  matched: boolean;
  errors: Array<string>;
}

export class Match {
  protected rules: Array<MatchRule>;

  constructor(options: MatchData) {
    this.rules = Array.from(options.rules);
  }

  public match(val: any): MatchResults {
    const data = mapToDict<any>(val);
    const results: MatchResults = {
      errors: [],
      matched: true,
    };

    for (const rule of this.rules) {
      if (!has(data, rule.key)) {
        results.errors.push(rule.key);
        results.matched = false;
        continue;
      }

      const value = get(data, rule.key);
      if (!this.matchRule(rule, value)) {
        results.errors.push(rule.key);
        results.matched = false;
        continue;
      }
    }

    return results;
  }

  public matchRule(rule: MatchRule, value: string): boolean {
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
      default:
        return false;
    }
  }

  public matchValue(ruleValue: RuleValue, value: string): boolean {
    if (isString(ruleValue)) {
      return ruleValue === value;
    }

    if (ruleValue.string) {
      return ruleValue.string === value;
    }

    if (ruleValue.regexp) {
      return ruleValue.regexp.test(value);
    }

    return false;
  }
}
