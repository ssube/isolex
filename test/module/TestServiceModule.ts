import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { ServiceModule } from 'src/module/ServiceModule';
import { Service } from 'src/Service';

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
    xit('should notify child services of events', async () => {
      // notify
    });

    xit('should manage the lifecycle of child services', async () => {

      // start
      // stop
    });

    itAsync('should create and save child services', async () => {
      const { metadata, module, svc } = await createModule();
      const next = module.getService(metadata);
      expect(svc).to.equal(next);
    });
  });
});
