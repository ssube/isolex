import { expect } from 'chai';

import { MatchRule, MatchRules, RuleOperator } from '../../src/utils/MatchRules';
import { describeLeaks, itLeaks } from '../helpers/async';

function createMatch(rule: Partial<MatchRule>): MatchRules {
  return new MatchRules({
    rules: [{
      key: '$.foo',
      operator: RuleOperator.Never,
      values: [],
      ...rule,
    }],
  });
}

describeLeaks('match utility', async () => {
  describeLeaks('every operator', async () => {
    itLeaks('should match a single string to itself', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    itLeaks('should reject a one:many match', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(false);
    });
  });

  describeLeaks('type checks', async () => {
    itLeaks('should reject a single string', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
      });
      const results = match.match('bar');
      expect(results.matched).to.equal(false);
    });

    itLeaks('should reject matched values that are not strings', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      const results = match.match({
        bar: 3,
        foo: true,
      });
      expect(results.matched).to.equal(false);
    });

    itLeaks('should match string values', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      expect(match.matchValue({
        string: 'bar',
      }, 'bar')).to.equal(true);
    });

    itLeaks('should match regexp values', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      expect(match.matchValue({
        regexp: /bar/,
      }, 'bar')).to.equal(true);
    });

    itLeaks('should reject unmatched values', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      expect(match.matchValue({
        number: 3,
        // tslint:disable-next-line:no-any
      } as any, 'bar')).to.equal(false);
    });
  });

  describeLeaks('any operator', async () => {
    itLeaks('should match a single string to itself', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    itLeaks('should match a single string to many', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });
  });

  describeLeaks('match removal', async () => {
    itLeaks('should remove string matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }],
      });

      const removed = match.removeMatches('foo bar bin');
      expect(removed).to.equal('foo  bin');
    });

    itLeaks('should remove multiple string matches', async () => {
      const match = new MatchRules({
        rules: [{
          key: 'foo',
          operator: RuleOperator.Any,
          values: [{
            string: 'bar',
          }, {
            string: 'bin',
          }],
        }, {
          key: 'foo',
          operator: RuleOperator.Any,
          values: [{
            string: 'baz',
          }],
        }],
      });

      const removed = match.removeMatches('foo bar bin');
      expect(removed).to.equal('foo  ');
    });

    itLeaks('should remove regexp matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ regexp: /\b\d{2,4}\b/g }],
      });

      const removed = match.removeMatches('1 12 123 1234 12345');
      expect(removed).to.equal('1    12345');
    });

    itLeaks('should only remove matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        // tslint:disable-next-line:no-any
        values: [{ number: 3 } as any],
      });

      const input = Math.random().toString();
      const removed = match.removeMatches(input);
      expect(removed).to.equal(input);
    });
  });
});
