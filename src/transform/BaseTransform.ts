import { Inject } from 'noicejs';

import { BotService, BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { FilterValue } from 'src/filter';
import { Transform, TransformData } from 'src/transform';
import { TemplateScope } from 'src/utils/Template';

export type BaseTransformOptions<TData extends TransformData> = BotServiceOptions<TData>;

@Inject()
export abstract class BaseTransform<TData extends TransformData> extends BotService<TData> implements Transform {
  constructor(options: BaseTransformOptions<TData>, schemaPath: string) {
    super(options, schemaPath);
  }

  public check(entity: FilterValue): Promise<boolean> {
    return this.checkFilters(entity, this.filters);
  }

  public abstract transform(entity: FilterValue, type: string, body: TemplateScope): Promise<TemplateScope>;

  protected mergeScope(entity: FilterValue, data: TemplateScope): TemplateScope {
    if (Command.isCommand(entity)) {
      return { cmd: entity, data };
    }

    if (Message.isMessage(entity)) {
      return { data, msg: entity };
    }

    return { data };
  }
}
