import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { getLogInfo, Service } from 'src/Service';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('service helpers', async () => {
  itAsync('should get log info', async () => {
    const svc = ineeda<Service>({
      id: 'test',
    });
    const log = getLogInfo(svc);
    expect(log.id).to.equal('test');
  });
});
