import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { BaseError } from 'noicejs';

import { Command, CommandVerb } from '../../src/entity/Command';
import { Message } from '../../src/entity/Message';
import { applyTransforms, extractBody, Transform } from '../../src/transform';
import { entityData } from '../../src/transform/BaseTransform';
import { TYPE_TEXT } from '../../src/utils/Mime';

/* eslint-disable sonarjs/no-identical-functions, @typescript-eslint/no-explicit-any */
describe('apply transforms helper', async () => {
  it('should return empty output with no transforms', async () => {
    const output = await applyTransforms([], ineeda<Message>({}), TYPE_TEXT, {});
    expect(output).to.deep.equal({});
  });

  it('should return transform data', async () => {
    const input = {
      bar: 3,
      foo: 'str',
    };
    const output = await applyTransforms([
      ineeda<Transform>({
        check: () => Promise.resolve(true),
        transform: (entity: unknown, type: unknown, data: unknown) => Promise.resolve(data),
      }),
    ], ineeda<Message>({}), TYPE_TEXT, input);
    expect(output).to.deep.equal(input);
  });

  it('should replace keys from previous transforms', async () => {
    const input = {
      bar: 3,
      foo: 'str',
    };
    const expected = 9;
    const output = await applyTransforms([
      ineeda<Transform>({
        check: () => Promise.resolve(true),
        transform: (entity: unknown, type: unknown, data: unknown) => Promise.resolve(data),
      }),
      ineeda<Transform>({
        check: () => Promise.resolve(true),
        transform: (entity: unknown, type: unknown, data: any) => ({
          ...data,
          bar: expected,
        }),
      }),
    ], ineeda<Message>({}), TYPE_TEXT, input);

    expect(output.bar).to.equal(expected, 'must replace bar with value from second transform');
    expect(output.foo).to.equal(input.foo, 'must retain foo');
  });

  it('should skip transforms based on filter', async () => {
    const output = await applyTransforms([
      ineeda<Transform>({
        check: () => Promise.resolve(true),
        transform: (entity: unknown, type: unknown, data: any) => ({
          ...data,
          foo: 3,
        }),
      }),
      ineeda<Transform>({
        check: () => Promise.resolve(false),
        transform: (entity: unknown, type: unknown, data: any) => ({
          ...data,
          bar: 9,
        }),
      }),
    ], ineeda<Message>({}), TYPE_TEXT, {});

    expect(output).to.have.property('foo');
    expect(output).not.to.have.property('bar');
  });
});

describe('entity data helper', async () => {
  it('should return command data', async () => {
    const data = entityData(new Command({
      data: {
        body: ['test'],
      },
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    }));
    expect(data.has('body')).to.equal(true);
  });

  it('should return message body', async () => {
    const data = entityData(new Message({
      body: 'test',
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(data.has('body')).to.equal(true);
  });

  it('should throw on unknown entities', async () => {
    expect(() => entityData(Math.random() as any)).to.throw(InvalidArgumentError);
    expect(() => entityData('test' as any)).to.throw(InvalidArgumentError);
  });
});

describe('extract body helper', async () => {
  it('should throw if body is not an array', async () => {
    expect(() => extractBody({
      body: 'test' as any,
    })).to.throw(BaseError);
  });

  it('should throw if body values are not strings', async () => {
    expect(() => extractBody({
      body: [1, 0, -1] as any,
    })).to.throw(BaseError);
  });

  it('should return the body', async () => {
    expect(extractBody({
      body: ['test'],
    })).to.equal('test');
  });
});
