import { expect } from 'chai';
import { MissingValueError } from 'noicejs';

import { BaseService, BaseServiceData, BaseServiceOptions } from '../src/BaseService';
import { ServiceEvent } from '../src/Service';
import { createService, createServiceContainer } from './helpers/container';

class StubService extends BaseService<BaseServiceData> {
  constructor(options: BaseServiceOptions<BaseServiceData>) {
    super(options, 'isolex#/definitions/service-data');
  }

  public async start() { /* noop */ }
  public async stop() { /* noop */ }
}

describe('base service', async () => {
  it('should throw on missing name', async () => {
    const { container } = await createServiceContainer();
    return expect(createService(container, StubService, {
      data: {
        filters: [],
        strict: true,
      },
      metadata: {
        kind: 'test',
        name: '',
      },
    })).to.eventually.be.rejectedWith(MissingValueError);
  });

  it('should log notifications', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, StubService, {
      data: {
        filters: [],
        strict: true,
      },
      metadata: {
        kind: 'foo',
        name: 'bar',
      },
    });
    await svc.notify(ServiceEvent.Tick);
  });

  it('should get ephemeral ID as UUID', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, StubService, {
      data: {
        filters: [],
        strict: true,
      },
      metadata: {
        kind: 'foo',
        name: 'bar',
      },
    });
    expect(svc.getId(false)).to.match(/[A-Za-z0-9-]{16}/);
  });

  it('should get stable ID as kind:name pair', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, StubService, {
      data: {
        filters: [],
        strict: true,
      },
      metadata: {
        kind: 'foo',
        name: 'bar',
      },
    });
    expect(svc.getId(true)).to.equal('foo:bar');
  });
});
