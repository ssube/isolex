import { Inject } from 'noicejs';

import { BotService } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { FilterValue } from 'src/filter/Filter';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
import { TemplateScope } from 'src/utils/Template';

@Inject()
export abstract class BaseTransform<TData extends TransformData> extends BotService<TData> implements Transform {

  constructor(options: TransformOptions<TData>, schemaPath: string) {
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
