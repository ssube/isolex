import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { GRAPH_OUTPUT_NAME_VALUE_PAIR } from 'src/graph/output/Pairs';
import { MapLike } from 'src/utils/Map';

export interface ServiceDefinition<TData = any> {
  metadata: ServiceMetadata;
  data: TData;
}

export enum ServiceLifecycle {
  Reload = 'reload',
  Reset = 'reset',
  Start = 'start',
  Stop = 'stop',
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

  notify(event: ServiceLifecycle): Promise<void>;
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

export const GRAPH_OUTPUT_SERVICE = new GraphQLObjectType({
  description: 'a service within the bot',
  fields: {
    id: {
      type: GraphQLString,
    },
    kind: {
      type: GraphQLString,
    },
    labels: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_VALUE_PAIR),
    },
    name: {
      type: GraphQLString,
    },
  },
  name: 'Service',
});
