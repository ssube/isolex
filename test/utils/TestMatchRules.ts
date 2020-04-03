import { expect } from 'chai';

import { MatchRule, MatchRules, RuleOperator } from '../../src/utils/MatchRules';

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

describe('match utility', async () => {
  describe('every operator', async () => {
    it('should match a single string to itself', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    it('should reject a one:many match', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(false);
    });

    it('should reject a single string when negated', async () => {
      const match = createMatch({
        negate: true,
        operator: RuleOperator.Every,
        values: [{
          string: 'bar',
        }, {
          string: 'foo',
        }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(false);
    });
  });

  describe('type checks', async () => {
    it('should reject a single string', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
      });
      const results = match.match('bar');
      expect(results.matched).to.equal(false);
    });

    it('should reject matched values that are not strings', async () => {
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

    it('should match string values', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      expect(match.matchValue({
        string: 'bar',
      }, 'bar')).to.equal(true);
    });

    it('should match regexp values', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      expect(match.matchValue({
        regexp: /bar/,
      }, 'bar')).to.equal(true);
    });

    it('should reject unmatched values', async () => {
      const match = createMatch({
        operator: RuleOperator.Every,
        values: [{ string: 'bar' }, { string: 'foo' }],
      });
      expect(match.matchValue({
        number: 3,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, 'bar')).to.equal(false);
    });
  });

  describe('any operator', async () => {
    it('should match a single string to itself', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    it('should match a single string to many', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }, { string: 'bin' }, { string: 'baz' }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });

    it('should match a single string to any when negated', async () => {
      const match = createMatch({
        negate: true,
        operator: RuleOperator.Any,
        values: [{
          string: 'bar',
        }, {
          string: 'foo',
        }],
      });
      const results = match.match({
        foo: 'bar',
      });
      expect(results.matched).to.equal(true);
    });
  });

  describe('match removal', async () => {
    it('should remove string matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ string: 'bar' }],
      });

      const removed = match.removeMatches('foo bar bin');
      expect(removed).to.equal('foo  bin');
    });

    it('should remove multiple string matches', async () => {
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

    it('should remove regexp matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        values: [{ regexp: /\b\d{2,4}\b/g }],
      });

      const removed = match.removeMatches('1 12 123 1234 12345');
      expect(removed).to.equal('1    12345');
    });

    it('should only remove matches', async () => {
      const match = createMatch({
        operator: RuleOperator.Any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        values: [{ number: 3 } as any],
      });

      const input = Math.random().toString();
      const removed = match.removeMatches(input);
      expect(removed).to.equal(input);
    });
  });
});
