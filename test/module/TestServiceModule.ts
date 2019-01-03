import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { ServiceModule } from 'src/module/ServiceModule';
import { Service, ServiceEvent } from 'src/Service';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

const TEST_SERVICE_NAME = 'test-service';

async function createModule() {
  const metadata = {
    kind: TEST_SERVICE_NAME,
    name: TEST_SERVICE_NAME,
  };
  const testSvc = ineeda<Service>(metadata);

  const module = new ServiceModule();
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

describeAsync('DI modules', async () => {
  describeAsync('service module', async () => {
    it('should notify child services of events', async () => {
      const { module, svc } = await createModule();
      svc.notify = spy();

      await module.notify(ServiceEvent.Start);
      expect(svc.notify).to.have.been.calledWith(ServiceEvent.Start);
    });

    it('should manage the lifecycle of child services', async () => {
      const { module, svc } = await createModule();
      svc.start = spy();
      svc.stop = spy();

      await module.start();
      expect(svc.start).to.have.callCount(1);
      expect(svc.stop).to.have.callCount(0);

      await module.stop();
      expect(svc.start).to.have.callCount(1);
      expect(svc.stop).to.have.callCount(1);
    });

    itAsync('should create and save child services', async () => {
      const { metadata, module, svc } = await createModule();
      const next = module.getService(metadata);

      expect(svc).to.equal(next);
    });
  });
});
