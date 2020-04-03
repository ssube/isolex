import { expect } from 'chai';
import { stub } from 'sinon';

import { RequestFactory } from '../../src/utils/Request';
import { createContainer } from '../helpers/container';

describe('request factory', async () => {
  it('should invoke request and return promise', async () => {
    const promise = stub().returns(Promise.resolve(true));
    const r = stub().returns({
      promise,
    });
    const { container } = await createContainer();
    const rf = await container.create(RequestFactory, {}, r);

    await expect(rf.create({
      url: 'https://example.com',
    })).to.eventually.equal(true);
    expect(promise).to.have.callCount(1);
    expect(r).to.have.callCount(1);
  });

  xit('should default to network requests', async () => {
    const { container } = await createContainer();
    const rf = await container.create(RequestFactory, {});

    await expect(rf.create({
      url: 'https://google.com',
    })).to.eventually.contain('About Google');
  });
});
