import { Inject } from 'noicejs';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseTransform } from 'src/transform/BaseTransform';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
import { JsonPath } from 'src/utils/JsonPath';
import { dictToMap, mapToDict } from 'src/utils/Map';
import { TYPE_JSON } from 'src/utils/Mime';

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

  public async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    const scope = this.mergeScope(cmd, msg);
    const out = new Map();
    for (const [key, query] of this.queries) {
      this.logger.debug({ key, query, scope }, 'executing jsonpath query');
      const result = this.jsonpath.query(scope, query);
      out.set(key, result);
    }
    const body = JSON.stringify(mapToDict(out));
    return [Message.reply(cmd.context, TYPE_JSON, body)];
  }
}
