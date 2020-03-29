import { mustExist } from '@apextoaster/js-utils';
import { Counter, CounterConfiguration, DefaultMetricsCollectorConfiguration, Registry } from 'prom-client';

import { Service } from '../Service';

export interface CollectorOptions extends DefaultMetricsCollectorConfiguration {
  timeout: number;
  register: Registry;
}

export type Collector = (options: CollectorOptions | undefined) => void;

export type StringCounter = Counter<string>;

export function createServiceCounter(registry: Registry, config: Partial<CounterConfiguration<string>>): StringCounter {
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

export function incrementServiceCounter(svc: Service, counter: StringCounter, data: object) {
  counter.inc({
    ...data,
    serviceId: svc.id,
    serviceKind: svc.kind,
    serviceName: svc.name,
  });
}
