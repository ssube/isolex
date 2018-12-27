import * as jp from 'jsonpath';

import { Command } from 'src/entity/Command';
import { BaseTransform } from 'src/transform/BaseTransform';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';

/**
 * Dictionary of templates to be compiled.
 */
export interface FlattenTransformData extends TransformData {
  deep: boolean;
  join: string;
  keys: Array<string>;
}

export type FlattenTransformOptions = TransformOptions<FlattenTransformData>;

export class FlattenTransform extends BaseTransform<FlattenTransformData> implements Transform {
  protected readonly keys: Array<string>;

  constructor(options: FlattenTransformOptions) {
    super(options, 'isolex#/definitions/service-transform-flatten');

    this.keys = Array.from(this.data.keys);
  }

  public async transform(cmd: Command, type: string, body: any): Promise<any> {
    const scope = this.mergeScope(cmd, body);
    this.logger.debug({ cmd, scope }, 'running flatten transform');

    const parts = [];
    for (const key of this.keys) {
      const value = jp.query(scope, key);
      parts.push(...value);
    }

    return parts.join(this.data.join);
  }
}
