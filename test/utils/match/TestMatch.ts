import { expect } from 'chai';

import { Match, MatchRule, RuleOperator } from '../../../src/utils/match';
import { describeLeaks, itLeaks } from '../../helpers/async';

function createMatch(rule: Partial<MatchRule>): Match {
  return new Match({
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

    itLeaks('should never match a single string to many', async () => {
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
      const match = new Match({
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

  });
});
