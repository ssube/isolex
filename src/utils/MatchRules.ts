import { doesExist } from '@apextoaster/js-utils';
import { JSONPath } from 'jsonpath-plus';

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

export class MatchRules {
  protected rules: Array<MatchRule>;

  constructor(options: MatchData) {
    this.rules = Array.from(options.rules);
  }

  public match(data: unknown): MatchResults {
    const results: MatchResults = {
      errors: [],
      matched: true,
    };

    if (typeof data === 'string') {
      results.matched = false;
      return results;
    }

    for (const rule of this.rules) {
      const values = JSONPath({
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        json: data as any,
        path: rule.key,
      });

      if (this.matchRule(rule, values) === false) {
        results.errors.push(rule.key);
        results.matched = false;
      }
    }

    return results;
  }

  public matchRule(rule: MatchRule, values: Array<string>): boolean {
    // no matching values should fail (#561)
    if (values.length === 0 && rule.values.length > 0) {
      return false;
    }

    let match = true;
    for (const value of values) {
      /* eslint-disable-next-line @typescript-eslint/tslint/config */
      if (typeof value !== 'string') {
        match = false;
        continue;
      }

      match = match && this.matchRuleOperator(rule, value);
    }

    return match;
  }

  public matchRuleOperator(rule: MatchRule, value: string): boolean {
    switch (rule.operator) {
      case RuleOperator.Any:
        return this.matchRuleAny(rule, value);
      case RuleOperator.Every:
        return this.matchRuleEvery(rule, value);
      default:
        return false;
    }
  }

  public matchRuleAny(rule: MatchRule, value: string): boolean {
    if (rule.negate === true) {
      return rule.values.some((it) => this.matchValue(it, value) === false);
    } else {
      return rule.values.some((it) => this.matchValue(it, value));
    }
  }

  public matchRuleEvery(rule: MatchRule, value: string): boolean {
    if (rule.negate === true) {
      return rule.values.every((it) => this.matchValue(it, value) === false);
    } else {
      return rule.values.every((it) => this.matchValue(it, value));
    }
  }

  public matchValue(ruleValue: RuleValue, value: string): boolean {
    if (doesExist(ruleValue.string)) {
      return ruleValue.string === value;
    }

    if (doesExist(ruleValue.regexp)) {
      return ruleValue.regexp.test(value);
    }

    return false;
  }

  public removeMatches(original: string): string {
    /* eslint-disable-next-line arrow-body-style */
    return this.rules.reduce((prev, rule) => {
      return rule.values.reduce((innerPrev, value) => {
        if (doesExist(value.regexp)) {
          return innerPrev.replace(value.regexp, '');
        }

        if (doesExist(value.string)) {
          return innerPrev.replace(value.string, '');
        }

        return innerPrev;
      }, prev);
    }, original);
  }
}
