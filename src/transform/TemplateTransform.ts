import { isString } from 'lodash';
import { BaseError, Inject } from 'noicejs';

import { Transform, TransformData } from '.';
import { INJECT_TEMPLATE } from '../BaseService';
import { FilterValue } from '../filter';
import { mustExist } from '../utils';
import { makeDict } from '../utils/Map';
import { Template, TemplateScope } from '../utils/Template';
import { BaseTransform, BaseTransformOptions } from './BaseTransform';

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
      if (!isString(result)) {
        throw new BaseError('template did not return string');
      }
      out.set(key, [result]);
    }
    return makeDict(out);
  }
}
