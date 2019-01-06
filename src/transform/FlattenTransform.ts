import { Inject } from 'noicejs';

import { FilterValue } from 'src/filter/Filter';
import { BaseTransform } from 'src/transform/BaseTransform';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
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

export type FlattenTransformOptions = TransformOptions<FlattenTransformData>;

@Inject('jsonpath')
export class FlattenTransform extends BaseTransform<FlattenTransformData> implements Transform {
  protected readonly keys: Array<string>;
  protected readonly jsonpath: JsonPath;

  constructor(options: FlattenTransformOptions) {
    super(options, 'isolex#/definitions/service-transform-flatten');

    this.keys = Array.from(this.data.keys);
    this.jsonpath = options.jsonpath;
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
