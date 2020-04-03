import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { getLogInfo, Service } from '../src/Service';

describe('service helpers', async () => {
  it('should get log info', async () => {
    const svc = ineeda<Service>({
      id: 'test',
    });
    const log = getLogInfo(svc);
    expect(log.id).to.equal('test');
  });
});
