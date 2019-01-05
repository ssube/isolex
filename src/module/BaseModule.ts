import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { Constructor } from 'noicejs/Container';
import { Service } from 'src/Service';
import { BaseServiceOptions, BaseServiceData } from 'src/BaseService';
import { BotServiceData } from 'src/BotService';

export abstract class BaseModule extends Module {
  protected bindService<TService extends Service>(svc: Constructor<TService, any>) {
    return this.bind(kebabCase(svc.name)).toConstructor(svc);
  }
}
