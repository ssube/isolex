import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { getLogInfo, Service } from '../src/Service';
import { describeLeaks, itLeaks } from './helpers/async';

describeLeaks('service helpers', async () => {
  itLeaks('should get log info', async () => {
    const svc = ineeda<Service>({
      id: 'test',
    });
    const log = getLogInfo(svc);
    expect(log.id).to.equal('test');
  });
});
