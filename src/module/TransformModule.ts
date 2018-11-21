import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { FlattenTransform } from 'src/transform/FlattenTransform';
import { JsonpathTransform } from 'src/transform/JsonpathTransform';
import { TemplateTransform } from 'src/transform/TemplateTransform';

export class TransformModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind(kebabCase(FlattenTransform.name)).toConstructor(FlattenTransform);
    this.bind(kebabCase(JsonpathTransform.name)).toConstructor(JsonpathTransform);
    this.bind(kebabCase(TemplateTransform.name)).toConstructor(TemplateTransform);
 }
}
