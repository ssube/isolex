import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { getTestContextData } from '../helpers/context';

describe('command', async () => {
  it('should copy data', async () => {
    const data = {
      test: ['1'],
    };
    const cmd = new Command({
      context: ineeda<Context>(),
      data,
      labels: {},
      noun: 'test_cmd',
      verb: CommandVerb.Get,
    });

    expect(cmd.data).not.to.equal(data);
    expect(cmd.data.size).to.equal(1);
    expect(cmd.data.get('test')).to.deep.equal(data.test);

    expect(cmd.get('test')).to.deep.equal(['1']);
  });

  it('should get args by name', async () => {
    const data = {
      test: ['1'],
    };
    const cmd = new Command({
      context: ineeda<Context>(),
      data,
      labels: {},
      noun: 'test_cmd',
      verb: CommandVerb.Get,
    });

    expect(cmd.get('test')).to.deep.equal(['1']);
  });

  it('should convert itself to JSON', async () => {
    const cmd = new Command({
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    });
    const json = cmd.toJSON();

    expect(json).to.have.property('data');
    expect(json).to.have.property('labels');
    expect(json).to.have.property('noun');
    expect(json).to.have.property('verb');
  });

  it('should convert its context to JSON', async () => {
    const cmd = new Command({
      context: new Context(getTestContextData()),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    });
    const json = cmd.toJSON();

    expect(json).to.have.property('context');
    expect(json).to.have.deep.property('data', []);
    expect(json).to.have.deep.property('labels', []);
  });
});
