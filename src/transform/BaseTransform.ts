import { Inject } from 'noicejs';

import { BotService } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';

@Inject()
export abstract class BaseTransform<TData extends TransformData> extends BotService<TData> implements Transform {

  constructor(options: TransformOptions<TData>, schemaPath: string) {
    super(options, schemaPath);
  }

  public check(cmd: Command): Promise<boolean> {
    return this.checkFilters(cmd, this.filters);
  }

  public abstract transform(cmd: Command, type: string, body: any): Promise<any>;

  protected mergeScope(cmd: Command, data: any): any {
    return { cmd, data };
  }
}
