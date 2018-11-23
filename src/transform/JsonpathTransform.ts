import * as jp from 'jsonpath';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { mapToDict, normalizeMap } from 'src/utils';
import { TYPE_JSON } from 'src/utils/Mime';

import { BaseTransform } from './BaseTransform';
import { Transform, TransformData, TransformOptions } from './Transform';

export interface JsonpathTransformData extends TransformData {
  queries: {
    [key: string]: string;
  };
}

export type JsonpathTransformOptions = TransformOptions<JsonpathTransformData>;

export class JsonpathTransform extends BaseTransform<JsonpathTransformData> implements Transform {
  protected queries: Map<string, string>;

  constructor(options: JsonpathTransformOptions) {
    super(options);

    this.queries = normalizeMap(options.data.queries);
  }

  public async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    const scope = this.mergeScope(cmd, msg);
    const out = new Map();
    for (const [key, query] of this.queries) {
      this.logger.debug({ key, query, scope }, 'executing jsonpath query');
      const result = jp.query(scope, query);
      out.set(key, result);
    }
    const body = JSON.stringify(mapToDict(out));
    return [Message.reply(cmd.context, TYPE_JSON, body)];
  }
}
