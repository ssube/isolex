import { Inject } from 'noicejs';

import { INJECT_JSONPATH } from 'src/BaseService';
import { FilterValue } from 'src/filter';
import { Transform, TransformData } from 'src/transform';
import { BaseTransform, BaseTransformOptions } from 'src/transform/BaseTransform';
import { mustExist } from 'src/utils';
import { JsonPath } from 'src/utils/JsonPath';
import { TemplateScope } from 'src/utils/Template';

/**
 * Dictionary of templates to be compiled.
 */
export interface FlattenTransformData extends TransformData {
  deep: boolean;
  join: string;
  keys: Array<string>;
}

@Inject(INJECT_JSONPATH)
export class FlattenTransform extends BaseTransform<FlattenTransformData> implements Transform {
  protected readonly keys: Array<string>;
  protected readonly jsonpath: JsonPath;

  constructor(options: BaseTransformOptions<FlattenTransformData>) {
    super(options, 'isolex#/definitions/service-transform-flatten');

    this.keys = Array.from(this.data.keys);
    this.jsonpath = mustExist(options[INJECT_JSONPATH]);
  }

  public async transform(entity: FilterValue, type: string, body: TemplateScope): Promise<TemplateScope> {
    const scope = this.mergeScope(entity, body);
    this.logger.debug({ entity, scope }, 'running flatten transform');

    const parts = [];
    for (const key of this.keys) {
      const value = this.jsonpath.query(scope, key);
      parts.push(...value);
    }

    return parts.join(this.data.join);
  }
}
