import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { ServiceModule } from '../../src/module/ServiceModule';
import { Service, ServiceEvent } from '../../src/Service';
import { defer } from '../../src/utils/Async';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';

const TEST_SERVICE_NAME = 'test-service';

async function createModule() {
  const metadata = {
    kind: TEST_SERVICE_NAME,
    name: TEST_SERVICE_NAME,
  };
  const testSvc = ineeda<Service>(metadata);

  const module = new ServiceModule({
    timeout: 10,
  });
  module.bind(TEST_SERVICE_NAME).toInstance(testSvc);

  const { container } = await createContainer(module);

  const svc = await module.createService({
    data: {
      filters: [],
      strict: true,
    },
    metadata,
  });
  return { container, metadata, module, svc };
}

describeLeaks('DI modules', async () => {
  describeLeaks('service module', async () => {
    it('should notify child services of events', async () => {
      const { module, svc } = await createModule();
      const notify = svc.notify = spy();

      await module.notify(ServiceEvent.Start);
      expect(notify).to.have.been.calledWith(ServiceEvent.Start);
    });

    it('should manage the lifecycle of child services', async () => {
      const { module, svc } = await createModule();
      const start = svc.start = spy();
      const stop = svc.stop = spy();

      await module.start();
      expect(start).to.have.callCount(1);
      expect(stop).to.have.callCount(0);
      expect(module.size).to.equal(1);

      await module.stop();
      expect(start).to.have.callCount(1);
      expect(stop).to.have.callCount(1);
      expect(module.size).to.equal(0);

      await defer(50);
    });

    itLeaks('should create and save child services', async () => {
      const { metadata, module, svc } = await createModule();
      const next = module.getService(metadata);

      expect(svc).to.equal(next);
    });
  });
});
