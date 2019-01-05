import { Module } from 'noicejs';
import { BaseService, BaseServiceData } from 'src/BaseService';
import { kebabCase } from 'lodash';

export abstract class BaseModule extends Module {
  protected bindService(svc: BaseService<BaseServiceData>) {
    return this.bind(kebabCase(svc.name)).toConstructor(svc);
  }
}
