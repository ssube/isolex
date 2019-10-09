import { Router } from 'express';
import expressGraphQl from 'express-graphql';

import { EndpointData, RouterOptions } from '.';
import { GraphSchema, GraphSchemaData } from '../schema/graph';
import { ServiceDefinition } from '../Service';
import { BaseEndpoint, BaseEndpointOptions } from './BaseEndpoint';

export interface GraphEndpointData extends EndpointData {
  graph: ServiceDefinition<GraphSchemaData>;
  graphiql: boolean;
}

export class GraphEndpoint extends BaseEndpoint<GraphEndpointData> {
  constructor(options: BaseEndpointOptions<GraphEndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-graph');
    this.logger.debug({ data: options.data, metadata: options.metadata }, 'graph endpoint constructor');
  }

  public async createRouter(options: RouterOptions): Promise<Router> {
    const router = await super.createRouter(options);
    this.logger.debug({ data: this.data, graph: this.data.graph }, 'graph create router');
    const graph = await this.services.createService<GraphSchema, GraphSchemaData>(this.data.graph);

    return router.use(expressGraphQl({
      graphiql: this.data.graphiql,
      schema: graph.schema,
    }));
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/graph',
    ];
  }
}
