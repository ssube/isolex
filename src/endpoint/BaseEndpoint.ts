import { IRoute } from 'express';

import { BotService, BotServiceOptions } from 'src/BotService';
import { Endpoint, EndpointData } from 'src/endpoint';

export type BaseEndpointOptions<TData extends EndpointData> = BotServiceOptions<TData>;

export abstract class BaseEndpoint<TData extends EndpointData> extends BotService<TData> implements Endpoint {
  public get paths(): Array<string> {
    return [
      this.id,
      `${this.kind}/${this.name}`,
    ];
  }

  abstract register(router: IRoute): void;

  public async start(): Promise<void> {
    /* noop */
  }

  public async stop(): Promise<void> {
    /* noop */
  }
}