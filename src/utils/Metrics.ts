import { Counter, CounterConfiguration, DefaultMetricsCollectorConfiguration, Registry } from 'prom-client';

import { mustExist } from '.';
import { Service } from '../Service';

export interface CollectorOptions extends DefaultMetricsCollectorConfiguration {
  timeout: number;
  register: Registry;
}

export type Collector = (options: CollectorOptions) => ReturnType<typeof setInterval>;

export function createServiceCounter(registry: Registry, config: Partial<CounterConfiguration>): Counter {
  const { labelNames = [], name } = config;
  const combinedLabels = [...labelNames, 'serviceId', 'serviceKind', 'serviceName'];

  const fullName = 'isolex_' + mustExist(name);

  return new Counter({
    help: 'default service counter',
    ...config,
    labelNames: combinedLabels,
    name: fullName,
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
