import { expect } from 'chai';

import { BaseCommand } from '../../../src/entity/base/BaseCommand';
import { CommandVerb } from '../../../src/entity/Command';

class TestCommand extends BaseCommand {
  public toJSON(): object {
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
    expect(cmd.getHeadOrNumber('bar', 3)).to.equal(3);
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
    expect(cmd.getHeadOrNumber('foo', 3)).to.equal(1);
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
    expect(cmd.getHeadOrNumber('foo', 3)).to.equal(3);
  });
});
