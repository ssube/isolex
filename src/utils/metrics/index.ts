import { Counter, CounterConfiguration, Registry } from 'prom-client';

import { Service } from '../../Service';

export function createServiceCounter(registry: Registry, config: Partial<CounterConfiguration>): Counter {
  const { labelNames = [] } = config;
  const combinedLabels = [...labelNames, 'serviceId', 'serviceKind', 'serviceName'];

  return new Counter({
    help: 'default service counter',
    name: 'change_me',
    ...config,
    labelNames: combinedLabels,
    registers: [registry],
  });
}

export function incrementServiceCounter(svc: Service, counter: Counter, data: object) {
  counter.inc({
    ...data,
    serviceId: svc.id,
    serviceKind: svc.kind,
    serviceName: svc.name,
  });
}
