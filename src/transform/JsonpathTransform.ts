import { Inject } from 'noicejs';

import { Command } from 'src/entity/Command';
import { BaseTransform } from 'src/transform/BaseTransform';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
import { JsonPath } from 'src/utils/JsonPath';
import { dictToMap, mapToDict } from 'src/utils/Map';

export interface JsonpathTransformData extends TransformData {
  queries: {
    [key: string]: string;
  };
}

export type JsonpathTransformOptions = TransformOptions<JsonpathTransformData>;

@Inject('jsonpath')
export class JsonpathTransform extends BaseTransform<JsonpathTransformData> implements Transform {
  protected jsonpath: JsonPath;
  protected queries: Map<string, string>;

  constructor(options: JsonpathTransformOptions) {
    super(options, 'isolex#/definitions/service-transform-jsonpath');

    this.jsonpath = options.jsonpath;
    this.queries = dictToMap(options.data.queries);
  }

  public async transform(cmd: Command, type: string, body: any): Promise<any> {
    const scope = this.mergeScope(cmd, body);
    const out = new Map();
    for (const [key, query] of this.queries) {
      this.logger.debug({ key, query, scope }, 'executing jsonpath query');
      const result = this.jsonpath.query(scope, query);
      out.set(key, result);
    }
    return mapToDict(out);
  }
}
