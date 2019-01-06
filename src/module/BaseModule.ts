import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { Constructor } from 'noicejs/Container';

import { BotService, BotServiceData, BotServiceOptions } from 'src/BotService';

export abstract class BaseModule extends Module {
  protected bindService<
    TData extends BotServiceData,
    TService extends BotService<TData>
  >(svc: Constructor<TService, BotServiceOptions<TData>>) {
    return this.bind(kebabCase(svc.name)).toConstructor(svc);
  }
}
