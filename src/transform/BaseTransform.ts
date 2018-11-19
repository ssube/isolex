import { BaseService } from 'src/BaseService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Parser } from 'src/parser/Parser';

import { Transform, TransformConfig, TransformOptions } from './Transform';

export abstract class BaseTransform<TData extends TransformConfig> extends BaseService<TData> implements Transform {
  protected readonly parsers: Array<Parser>;

  constructor(options: TransformOptions<TData>) {
    super(options);

    this.parsers = [];
  }

  public async start() {
    for (const def of this.data.parsers) {
      const parser = await this.bot.createService<Parser, any>(def);
      this.parsers.push(parser);
    }
  }

  public async stop() {
    /* noop */
  }

  public abstract transform(cmd: Command, msg: Message): Promise<Array<any>>;

  protected mergeScope(cmd: Command, data: any): any {
    return { cmd: cmd.toJSON(), data };
  }
}
