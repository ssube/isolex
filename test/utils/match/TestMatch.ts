import { expect } from 'chai';

import { Match, RuleOperator } from 'src/utils/match';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('match utility', async () => {
  describeAsync('every operator', async () => {
    itAsync('should match a single string to itself', async () => {
      const match = new Match({
        rules: [{
          key: 'foo',
          operator: RuleOperator.Every,
          values: [{ string: 'bar' }],
        }],
      });

      expect(match.match({
        foo: 'bar',
      })).to.equal(true);
    });

    itAsync('should never match a single string to many', async () => {
      const match = new Match({
        rules: [{
          key: 'foo',
          operator: RuleOperator.Every,
          values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
        }],
      });

      expect(match.match({
        foo: 'bar',
      })).to.equal(false);
    });
  });

  describeAsync('any operator', async () => {
    itAsync('should match a single string to itself', async () => {
      const match = new Match({
        rules: [{
          key: 'foo',
          operator: RuleOperator.Any,
          values: [{ string: 'bar' }],
        }],
      });

      expect(match.match({
        foo: 'bar',
      })).to.equal(true);
    });

    itAsync('should match a single string to many', async () => {
      const match = new Match({
        rules: [{
          key: 'foo',
          operator: RuleOperator.Any,
          values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
        }],
      });

      expect(match.match({
        foo: 'bar',
      })).to.equal(true);
    });
  });
});
