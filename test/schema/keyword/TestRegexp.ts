import { expect } from 'chai';

import { Schema } from '../../../src/schema';
import { RuleValue } from '../../../src/utils/MatchRules';

describe('json schema', async () => {
  describe('regexp keyword', async () => {
    it('should match regexp instances', async () => {
      const schema = new Schema();
      const rule: RuleValue = {
        regexp: /foo/,
      };
      const result = schema.match(rule, 'isolex#/definitions/match-rule-value');
      expect(result.valid).to.equal(true);
    });

    it('should negate matching regexp instances', async () => {
      const schema = new Schema({
        properties: {
          regexp: {
            regexp: false,
          },
        },
      });
      const rule: RuleValue = {
        regexp: /foo/,
      };
      const result = schema.match(rule);
      expect(result.valid).to.equal(false);
    });

    it('should match regexp flags', async () => {
      const schema = new Schema({
        properties: {
          regexp: {
            regexp: {
              flags: 'gu',
            },
          },
        },
        type: 'object',
      });
      const rule: RuleValue = {
        regexp: /foo/gu,
      };
      const result = schema.match(rule);
      expect(result.valid).to.equal(true);
    });

    it('should not match other things', async () => {
      const schema = new Schema();
      const rule = {
        regexp: 'foo',
      };
      const result = schema.match(rule, 'isolex#/definitions/match-rule-value');
      expect(result.valid).to.equal(false);
    });
  });
});
