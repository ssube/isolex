import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Message } from '../../src/entity/Message';
import { applyTransforms, Transform } from '../../src/transform';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';

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
        transform: (entity: unknown, type: unknown, data: unknown) => {
          return {
            ...data,
            bar: 9,
          };
        },
      }),
    ], ineeda<Message>({}), TYPE_TEXT, input);

    expect(output.bar).to.equal(9, 'must replace bar with value from second transform');
    expect(output.foo).to.equal(input.foo, 'must retain foo');
  });
});
