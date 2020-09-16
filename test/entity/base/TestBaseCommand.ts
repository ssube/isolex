import { expect } from 'chai';
import { DEFAULT_SAFE_SCHEMA } from 'js-yaml';

import { BaseCommand } from '../../../src/entity/base/BaseCommand';
import { CommandVerb } from '../../../src/entity/Command';

class TestCommand extends BaseCommand {
  public toJSON() {
    return {};
  }
}

// tslint:disable:no-identical-functions
describe('base command', async () => {
  it('should get head from each key', async () => {
    const cmd = new TestCommand({
      data: {
        foo: ['1', '2'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    });
    expect(cmd.getHead('foo')).to.equal('1');
  });

  it('should convert head to a number', async () => {
    const cmd = new TestCommand({
      data: {
        foo: ['1', '2'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    });
    expect(cmd.getNumber('foo')).to.equal(1);
  });

  it('should get a default value when key is missing', async () => {
    const cmd = new TestCommand({
      data: {
        foo: ['1', '2'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    });
    expect(cmd.getHeadOrDefault('bar', '3')).to.equal('3');
  });

  it('should get a default number when key is missing', async () => {
    const cmd = new TestCommand({
      data: {
        foo: ['1', '2'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    });

    const EXPECTED_VALUE = 3;
    expect(cmd.getHeadOrNumber('bar', EXPECTED_VALUE)).to.equal(EXPECTED_VALUE);
  });

  it('should get a number when key exists', async () => {
    const cmd = new TestCommand({
      data: {
        foo: ['1', '2'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    });

    const EXPECTED_VALUE = 1;
    const DEFAULT_VALUE = 3;
    expect(cmd.getHeadOrNumber('foo', DEFAULT_VALUE)).to.equal(EXPECTED_VALUE);
  });

  it('should get a default number when value is NaN', async () => {
    const cmd = new TestCommand({
      data: {
        foo: ['definitely not a number', 'also not a number'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Create,
    });

    const EXPECTED_VALUE = 3;
    expect(cmd.getHeadOrNumber('foo', EXPECTED_VALUE)).to.equal(EXPECTED_VALUE);
  });
});
