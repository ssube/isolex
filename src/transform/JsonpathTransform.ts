import { Inject } from 'noicejs';

import { INJECT_JSONPATH } from 'src/BaseService';
import { FilterValue } from 'src/filter';
import { BaseTransform } from 'src/transform/BaseTransform';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
import { mustExist } from 'src/utils';
import { JsonPath } from 'src/utils/JsonPath';
import { dictToMap, mapToDict } from 'src/utils/Map';
import { TemplateScope } from 'src/utils/Template';

export interface JsonpathTransformData extends TransformData {
  queries: {
    [key: string]: string;
  };
}

export type JsonpathTransformOptions = TransformOptions<JsonpathTransformData>;

@Inject(INJECT_JSONPATH)
export class JsonpathTransform extends BaseTransform<JsonpathTransformData> implements Transform {
  protected readonly jsonpath: JsonPath;
  protected readonly queries: Map<string, string>;

  constructor(options: JsonpathTransformOptions) {
    super(options, 'isolex#/definitions/service-transform-jsonpath');

    this.jsonpath = mustExist(options[INJECT_JSONPATH]);
    this.queries = dictToMap(options.data.queries);
  }

  public async transform(entity: FilterValue, type: string, body: TemplateScope): Promise<TemplateScope> {
    const scope = this.mergeScope(entity, body);
    const out = new Map();
    for (const [key, query] of this.queries) {
      this.logger.debug({ key, query, scope }, 'executing jsonpath query');
      const result = this.jsonpath.query(scope, query);
      out.set(key, result);
    }
    return mapToDict(out);
  }
}
