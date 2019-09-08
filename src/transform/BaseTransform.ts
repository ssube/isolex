import { Inject } from 'noicejs';

import { Transform, TransformData } from '.';
import { BotService, BotServiceOptions } from '../BotService';
import { Command } from '../entity/Command';
import { Message } from '../entity/Message';
import { FilterValue } from '../filter';
import { makeDict, makeMap, pushMergeMap } from '../utils/Map';
import { TemplateScope } from '../utils/Template';

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
    const ed = entityData(entity);
    const map = pushMergeMap(ed, makeMap(data));
    return makeDict(map);
  }
}

export function entityData(entity: FilterValue): Map<string, Array<string>> {
  if (Command.isCommand(entity)) {
    return entity.data;
  }

  if (Message.isMessage(entity)) {
    return makeMap({
      body: [entity.body],
    });
  }

  throw new Error();
}
