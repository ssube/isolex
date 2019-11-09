import { ModuleOptions } from 'noicejs';

import { FlattenTransform } from '../transform/FlattenTransform';
import { JsonpathTransform } from '../transform/JsonpathTransform';
import { TemplateTransform } from '../transform/TemplateTransform';
import { BaseModule } from './BaseModule';

export class TransformModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bindService(FlattenTransform);
    this.bindService(JsonpathTransform);
    this.bindService(TemplateTransform);
  }
}
