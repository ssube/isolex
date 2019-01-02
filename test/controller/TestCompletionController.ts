import { expect } from 'chai';

import { collectOrComplete } from 'src/controller/CompletionController';
import { Command, CommandVerb } from 'src/entity/Command';

import { describeAsync, itAsync } from 'test/helpers/async';
import { ineeda } from 'ineeda';
import { Context } from 'src/entity/Context';
import { Parser } from 'src/parser/Parser';

describeAsync('completion helper', async () => {
  describeAsync('collect or complete', async () => {
    itAsync('should collect specified fields', async () => {
      const data = {
        foo: ['a'],
        bar: ['b'],
      };
      const cmd = new Command({
        data,
        labels: {},
        noun: 'test',
        verb: CommandVerb.Get,
      });
      const result = collectOrComplete<{
        foo: string;
      }>(cmd, {
        foo: {
          default: 'c',
          required: true,
          prompt: 'prompt',
        },
      });
      expect(result.complete).to.equal(true);
      if (result.complete === true) {
        expect(result.data).to.have.ownProperty('foo');
        expect(result.data.foo).to.deep.equal(data.foo);
      }
    });
    itAsync('should complete missing fields', async () => {
      const data = {
        foo: ['a'],
        bar: ['b'],
      };
      const cmd = new Command({
        context: ineeda<Context>({
          parser: ineeda<Parser>({
            id: 'test',
          }),
        }),
        data,
        labels: {},
        noun: 'test',
        verb: CommandVerb.Get,
      });
      const result = collectOrComplete<{
        fin: string;
      }>(cmd, {
        fin: {
          default: 'c',
          required: true,
          prompt: 'prompt',
        },
      });
      expect(result.complete).to.equal(false);
      if (result.complete === false) {
        expect(result.fragment.getHead('key')).to.equal('fin');
        expect(result.fragment.getHead('parser')).to.equal('test');
      }
    });
  });
});
