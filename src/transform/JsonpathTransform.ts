import { Inject } from 'noicejs';

import { INJECT_JSONPATH } from 'src/BaseService';
import { FilterValue } from 'src/filter';
import { Transform, TransformData } from 'src/transform';
import { BaseTransform, BaseTransformOptions } from 'src/transform/BaseTransform';
import { mustExist } from 'src/utils';
import { JsonPath } from 'src/utils/JsonPath';
import { makeMap, makeDict } from 'src/utils/Map';
import { TemplateScope } from 'src/utils/Template';

export interface JsonpathTransformData extends TransformData {
  queries: {
    [key: string]: string;
  };
}

@Inject(INJECT_JSONPATH)
export class JsonpathTransform extends BaseTransform<JsonpathTransformData> implements Transform {
  protected readonly jsonpath: JsonPath;
  protected readonly queries: Map<string, string>;

  constructor(options: BaseTransformOptions<JsonpathTransformData>) {
    super(options, 'isolex#/definitions/service-transform-jsonpath');

    this.jsonpath = mustExist(options[INJECT_JSONPATH]);
    this.queries = makeMap(options.data.queries);
  }

  public async transform(entity: FilterValue, type: string, body: TemplateScope): Promise<TemplateScope> {
    const scope = this.mergeScope(entity, body);
    const out = new Map();
    for (const [key, query] of this.queries) {
      this.logger.debug({ key, query, scope }, 'executing jsonpath query');
      const result = this.jsonpath.query(scope, query);
      out.set(key, result);
    }
    return makeDict(out);
  }
}
