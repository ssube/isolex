import { MapLike } from './utils/Map';

export interface ServiceDefinition<TData = any> {
  metadata: ServiceMetadata;
  data: TData;
}

export interface ServiceMetadata {
  /**
   * The service's unique id.
   */
  readonly id?: string;

  /**
   * The service class name, typically kebab-cased.
   */
  readonly kind: string;

  /**
   * The service labels.
   */
  readonly labels?: MapLike<string>;

  /**
   * The service instance name (friendly name for humans, not unlike the AWS `Name` tag).
   */
  readonly name: string;
}

export interface Service extends ServiceMetadata {
  readonly id: string;

  start(): Promise<void>;
  stop(): Promise<void>;
}

export function getLogInfo(svc: Service) {
  return {
    id: svc.id,
    kind: svc.kind,
    name: svc.name,
  };
}
