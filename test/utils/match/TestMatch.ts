import { expect } from 'chai';

import { Match, MatchRule, RuleOperator } from '../../../src/utils/match';
import { describeAsync, itAsync } from '../../helpers/async';

function createMatch(rule: Partial<MatchRule>): Match {
  return new Match({
    rules: [{
      key: 'foo',
      operator: RuleOperator.Never,
      values: [],
      ...rule,
    }],
  });
}

describeAsync('match utility', async () => {
  describeAsync('every operator', async () => {
    itAsync('should match a single string to itself', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    itAsync('should never match a single string to many', async () => {
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

  describeAsync('any operator', async () => {
    itAsync('should match a single string to itself', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    itAsync('should match a single string to many', async () => {
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

  describeAsync('match removal', async () => {
    itAsync('should remove string matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }],
      });

      const removed = match.removeMatches('foo bar bin');
      expect(removed).to.equal('foo  bin');
    });

    itAsync('should remove multiple string matches', async () => {
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

    itAsync('should remove regexp matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ regexp: /\b\d{2,4}\b/g }],
      });

      const removed = match.removeMatches('1 12 123 1234 12345');
      expect(removed).to.equal('1    12345');
    });

  });
});
