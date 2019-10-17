import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Counter, Registry } from 'prom-client';
import { match, spy } from 'sinon';

import { Service } from '../../src/Service';
import { createServiceCounter, incrementServiceCounter } from '../../src/utils/Metrics';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('metrics utils', async () => {
  describeLeaks('create service counter helper', async () => {
    itLeaks('should create a counter with labels', async () => {
      expect(createServiceCounter(ineeda<Registry>({
        registerMetric() {
          // ?
        },
      }), {
        name: 'test',
      })).to.be.an.instanceOf(Counter);
    });
  });

  describeLeaks('increment service counter helper', async () => {
    itLeaks('should increment a counter with labels', async () => {
      const inc = spy();
      const counter = ineeda<Counter>({
        inc,
      });
      const labels = {
        id: '',
        kind: '',
        name: '',
      };
      incrementServiceCounter(ineeda<Service>(labels), counter, labels);
      expect(inc).to.have.been.calledOnce.and.calledWithMatch(match
        .has('id').and(match
          .has('kind').and(match
            .has('name').and(match
              .has('serviceId').and(match
                .has('serviceKind').and(match
                  .has('serviceName')))))));
    });
  });
});
