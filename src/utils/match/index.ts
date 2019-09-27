import { JSONPath } from 'jsonpath-plus';
import { isString } from 'lodash';

import { doesExist } from '..';

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

  public match(val: unknown): MatchResults {
    const results: MatchResults = {
      errors: [],
      matched: true,
    };

    if (isString(val)) {
      results.matched = false;
      return results;
    }

    for (const rule of this.rules) {
      const ruleValues = JSONPath({
        /* tslint:disable-next-line:no-any */
        json: val as any,
        path: rule.key,
      });

      for (const value of ruleValues) {
        if (!isString(value)) {
          results.errors.push(rule.key);
          results.matched = false;
          break;
        }

        if (!this.matchRule(rule, value)) {
          results.errors.push(rule.key);
          results.matched = false;
          break;
        }
      }
    }

    return results;
  }

  public matchRule(rule: MatchRule, value: string): boolean {
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
      return rule.values.some((it) => !this.matchValue(it, value));
    } else {
      return rule.values.some((it) => this.matchValue(it, value));
    }
  }

  public matchRuleEvery(rule: MatchRule, value: string): boolean {
    if (rule.negate === true) {
      return rule.values.every((it) => !this.matchValue(it, value));
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
