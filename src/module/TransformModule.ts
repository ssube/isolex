import { ModuleOptions } from 'noicejs';

import { BaseModule } from 'src/module/BaseModule';
import { FlattenTransform } from 'src/transform/FlattenTransform';
import { JsonpathTransform } from 'src/transform/JsonpathTransform';
import { TemplateTransform } from 'src/transform/TemplateTransform';

export class TransformModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bindService(FlattenTransform);
    this.bindService(JsonpathTransform);
    this.bindService(TemplateTransform);
 }
}
