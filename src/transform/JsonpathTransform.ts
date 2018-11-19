import * as jp from 'jsonpath';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceOptions } from 'src/Service';
import { mapToDict, normalizeMap } from 'src/utils';
import { TYPE_JSON } from 'src/utils/Mime';

import { BaseTransform } from './BaseTransform';
import { Transform, TransformConfig } from './Transform';

export interface JsonpathTransformConfig extends TransformConfig {
  queries: {
    [key: string]: string;
  };
}

export type JsonpathTransformOptions = ServiceOptions<JsonpathTransformConfig>;

export class JsonpathTransform extends BaseTransform<JsonpathTransformConfig> implements Transform {
  protected queries: Map<string, string>;

  constructor(options: JsonpathTransformOptions) {
    super(options);

    this.queries = normalizeMap(options.data.queries);
  }

  public async transform(cmd: Command, data: any): Promise<Array<Message>> {
    const scope = this.mergeScope(cmd, data);
    const out = new Map();
    for (const [key, query] of this.queries) {
      this.logger.debug({ key, query, scope }, 'executing jsonpath query');
      const result = jp.query(scope, query);
      out.set(key, result);
    }
    const body = mapToDict(out);
    return [Message.reply(cmd.context, TYPE_JSON, body)];
  }
}
