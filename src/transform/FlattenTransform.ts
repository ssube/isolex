import * as jp from 'jsonpath';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceOptions } from 'src/Service';
import { TYPE_TEXT } from 'src/utils/Mime';

import { BaseTransform } from './BaseTransform';
import { Transform, TransformData } from './Transform';

/**
 * Dictionary of templates to be compiled.
 */
export interface FlattenTransformData extends TransformData {
  deep: boolean;
  join: string;
  keys: Array<string>;
}

export type FlattenTransformOptions = ServiceOptions<FlattenTransformData>;

export class FlattenTransform extends BaseTransform<FlattenTransformData> implements Transform {
  protected readonly keys: Array<string>;

  constructor(options: FlattenTransformOptions) {
    super(options);

    this.keys = Array.from(this.data.keys);
  }

  public async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    const scope = this.mergeScope(cmd, msg);
    const parts = [];
    for (const key of this.keys) {
      const value = jp.query(scope, key);
      parts.push(...value);
    }
    const body = parts.join(this.data.join);
    return [Message.reply(cmd.context, TYPE_TEXT, body)];
  }
}

