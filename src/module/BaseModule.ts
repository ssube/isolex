import { kebabCase } from 'lodash';
import { Constructor, Module, ProviderType } from 'noicejs';

import { BotService, BotServiceData, BotServiceOptions } from '../BotService';

export abstract class BaseModule extends Module {
  protected bindService<
    TData extends BotServiceData,
    TService extends BotService<TData>
  >(svc: Constructor<TService, BotServiceOptions<TData>>) {
    return this.bindTo(kebabCase(svc.name), ProviderType.Constructor, svc);
  }
}
