import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { collectOrComplete } from 'src/controller/helpers';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Parser } from 'src/parser/Parser';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('completion helper', async () => {
  describeAsync('collect or complete', async () => {
    itAsync('should collect specified fields', async () => {
      const data = {
        bar: ['b'],
        foo: ['a'],
      };
      const cmd = new Command({
        data,
        labels: {},
        noun: 'test',
        verb: CommandVerb.Get,
      });
      const result = collectOrComplete<{
        foo: Array<string>;
      }>(cmd, {
        foo: {
          default: ['c'],
          prompt: 'prompt',
          required: true,
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
        bar: ['b'],
        foo: ['a'],
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
          prompt: 'prompt',
          required: true,
        },
      });
      expect(result.complete).to.equal(false);
      if (result.complete === false) {
        expect(result.fragment.getHead('key')).to.equal('fin');
        expect(result.fragment.getHead('parser')).to.equal('test');
      }
    });

    itAsync('should coerce values', async () => {
      const data = {
        bar: ['a'],
        foo: ['15'],
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
        bar: string;
        foo: number;
      }>(cmd, {
        bar: {
          default: 'c',
          prompt: 'prompt',
          required: true,
        },
        foo: {
          default: 3,
          prompt: 'prompt',
          required: true,
        },
      });
      expect(result.complete).to.equal(true);
      if (result.complete === true) {
        expect(result.data.bar).to.equal('a');
        expect(result.data.foo).to.equal(15);
      }
    });
  });
});
