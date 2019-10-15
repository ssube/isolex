import { expect } from 'chai';

import { Schema } from '../../../src/schema';
import { RuleValue } from '../../../src/utils/MatchRules';
import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('json schema', async () => {
  describeLeaks('regexp keyword', async () => {
    itLeaks('should match regexp instances', async () => {
      const schema = new Schema();
      const rule: RuleValue = {
        regexp: /foo/,
      };
      const result = schema.match(rule, 'isolex#/definitions/match-rule-value');
      expect(result.valid).to.equal(true);
    });

    itLeaks('should negate matching regexp instances', async () => {
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

    itLeaks('should match regexp flags', async () => {
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

    itLeaks('should not match other things', async () => {
      const schema = new Schema();
      const rule = {
        regexp: 'foo',
      };
      const result = schema.match(rule, 'isolex#/definitions/match-rule-value');
      expect(result.valid).to.equal(false);
    });
  });
});
