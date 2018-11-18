import * as jp from 'jsonpath';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceOptions } from 'src/Service';
import { normalizeMap } from 'src/utils';

import { BaseTransform } from './BaseTransform';
import { Transform } from './Transform';

export interface JsonpathTransformConfig {
  [key: string]: string;
}

export type JsonpathTransformOptions = ServiceOptions<JsonpathTransformConfig>;

export class JsonpathTransform extends BaseTransform<JsonpathTransformConfig> implements Transform {
  protected queries: Map<string, string>;

  constructor(options: JsonpathTransformOptions) {
    super(options);

    this.queries = normalizeMap(options.data);
  }

  public async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    const data = cmd.toJSON();
    const out = new Map();
    for (const [key, query] of this.queries) {
      const result = jp.query(data, query);
      out.set(key, result);
    }
    return [Message.reply(JSON.stringify(out), cmd.context)];
  }
}