import { BaseService } from 'src/BaseService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';

import { Transform, TransformConfig } from './Transform';

export abstract class BaseTransform<TData extends TransformConfig> extends BaseService<TData> implements Transform {
  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public abstract transform(cmd: Command, msg: Message): Promise<Array<any>>;
}