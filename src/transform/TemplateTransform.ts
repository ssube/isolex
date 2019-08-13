import { Inject } from 'noicejs';

import { INJECT_TEMPLATE } from 'src/BaseService';
import { FilterValue } from 'src/filter';
import { Transform, TransformData } from 'src/transform';
import { BaseTransform, BaseTransformOptions } from 'src/transform/BaseTransform';
import { mustExist } from 'src/utils';
import { makeDict } from 'src/utils/Map';
import { Template, TemplateScope } from 'src/utils/Template';

/**
 * Dictionary of templates to be compiled.
 */
export interface TemplateTransformData extends TransformData {
  templates: {
    [key: string]: string;
  };
}

@Inject(INJECT_TEMPLATE)
export class TemplateTransform extends BaseTransform<TemplateTransformData> implements Transform {
  protected readonly templates: Map<string, Template>;

  constructor(options: BaseTransformOptions<TemplateTransformData>) {
    super(options, 'isolex#/definitions/service-transform-template');

    this.templates = new Map();
    for (const [key, data] of Object.entries(options.data.templates)) {
      this.logger.debug({ key }, 'compiling template');
      const template = mustExist(options[INJECT_TEMPLATE]).compile(data);
      this.templates.set(key, template);
    }
  }

  public async transform(entity: FilterValue, type: string, body: TemplateScope): Promise<TemplateScope> {
    const scope = this.mergeScope(entity, body);
    const out = new Map();
    for (const [key, template] of this.templates) {
      this.logger.debug({ key, scope }, 'rendering template with scope');
      const result = template.render(scope);
      this.logger.debug({ key, result }, 'rendered template with scope');
      out.set(key, result);
    }
    return makeDict(out);
  }
}
