import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { BaseError } from 'noicejs';

import { Command, CommandVerb } from '../../src/entity/Command';
import { Message } from '../../src/entity/Message';
import { applyTransforms, extractBody, Transform } from '../../src/transform';
import { entityData } from '../../src/transform/BaseTransform';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';

/* eslint-disable sonarjs/no-identical-functions, @typescript-eslint/no-explicit-any */
describeLeaks('apply transforms helper', async () => {
  itLeaks('should return empty output with no transforms', async () => {
    const output = await applyTransforms([], ineeda<Message>({}), TYPE_TEXT, {});
    expect(output).to.deep.equal({});
  });

  itLeaks('should return transform data', async () => {
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

  itLeaks('should replace keys from previous transforms', async () => {
    const input = {
      bar: 3,
      foo: 'str',
    };
    const output = await applyTransforms([
      ineeda<Transform>({
        check: () => Promise.resolve(true),
        transform: (entity: unknown, type: unknown, data: unknown) => Promise.resolve(data),
      }),
      ineeda<Transform>({
        check: () => Promise.resolve(true),
        transform: (entity: unknown, type: unknown, data: any) => ({
          ...data,
          bar: 9,
        }),
      }),
    ], ineeda<Message>({}), TYPE_TEXT, input);

    expect(output.bar).to.equal(9, 'must replace bar with value from second transform');
    expect(output.foo).to.equal(input.foo, 'must retain foo');
  });

  itLeaks('should skip transforms based on filter', async () => {
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

describeLeaks('entity data helper', async () => {
  itLeaks('should return command data', async () => {
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

  itLeaks('should return message body', async () => {
    const data = entityData(new Message({
      body: 'test',
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(data.has('body')).to.equal(true);
  });

  itLeaks('should throw on unknown entities', async () => {
    expect(() => entityData(3 as any)).to.throw(InvalidArgumentError);
    expect(() => entityData('test' as any)).to.throw(InvalidArgumentError);
  });
});

describeLeaks('extract body helper', async () => {
  itLeaks('should throw if body is not an array', async () => {
    expect(() => extractBody({
      body: 'test' as any,
    })).to.throw(BaseError);
  });

  itLeaks('should throw if body values are not strings', async () => {
    expect(() => extractBody({
      body: [1, 2, 3] as any,
    })).to.throw(BaseError);
  });

  itLeaks('should return the body', async () => {
    expect(extractBody({
      body: ['test'],
    })).to.equal('test');
  });
});
