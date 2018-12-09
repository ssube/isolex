import { Counter, CounterConfiguration } from 'prom-client';

import { Service } from 'src/Service';

export function createServiceCounter(config: Partial<CounterConfiguration>): Counter {
  const { labelNames = [] } = config;
  labelNames.unshift('serviceId', 'serviceKind', 'serviceName');
  return new Counter({
    help: 'default service counter',
    name: 'change_me',
    ...config,
    labelNames,
  });
}

export function incrementServiceCounter(svc: Service, counter: Counter, data: any) {
  counter.inc({
    ...data,
    serviceId: svc.id,
    serviceKind: svc.kind,
    serviceName: svc.name,
  });
}
