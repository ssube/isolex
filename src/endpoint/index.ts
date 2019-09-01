import { Router } from 'express';

import { BotServiceData } from '../BotService';
import { Service } from '../Service';

export type EndpointData = BotServiceData;

export interface Endpoint extends Service {
  paths: Array<string>;

  createRouter(): Promise<Router>;
}
