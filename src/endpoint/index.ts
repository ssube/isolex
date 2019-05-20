import { IRoute } from 'express';

import { BotServiceData } from 'src/BotService';
import { Service } from 'src/Service';

export type EndpointData = BotServiceData;

export interface Endpoint extends Service {
  paths: Array<string>;

  register(router: IRoute): void;
}
