import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import { TemplateTransform } from 'src/transform/TemplateTransform';
import { JsonpathTransform } from 'src/transform/JsonpathTransform';

export class TransformModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind(kebabCase(JsonpathTransform.name)).toConstructor(JsonpathTransform);
    this.bind(kebabCase(TemplateTransform.name)).toConstructor(TemplateTransform);
 }
}
