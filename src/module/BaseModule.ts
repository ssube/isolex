import { kebabCase } from 'lodash';
import { Constructor, Module } from 'noicejs';

import { BotService, BotServiceData, BotServiceOptions } from '../BotService';

export abstract class BaseModule extends Module {
  protected bindService<
    TData extends BotServiceData,
    TService extends BotService<TData>
  >(svc: Constructor<TService, BotServiceOptions<TData>>) {
    return this.bind(kebabCase(svc.name)).toConstructor(svc);
  }
}
