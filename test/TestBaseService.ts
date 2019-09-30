import { expect } from 'chai';
import { MissingValueError } from 'noicejs';

import { BaseService, BaseServiceData, BaseServiceOptions } from '../src/BaseService';
import { ServiceEvent } from '../src/Service';
import { describeLeaks, itLeaks } from './helpers/async';
import { createService, createServiceContainer } from './helpers/container';

class StubService extends BaseService<BaseServiceData> {
  constructor(options: BaseServiceOptions<BaseServiceData>) {
    super(options, 'isolex#/definitions/service-data');
  }

  public async start() { /* noop */ }
  public async stop() { /* noop */ }
}

describeLeaks('base service', async () => {
  itLeaks('should throw on missing name', async () => {
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

  itLeaks('should log notifications', async () => {
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

  itLeaks('should get ephemeral ID as UUID', async () => {
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

  itLeaks('should get stable ID as kind:name pair', async () => {
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
