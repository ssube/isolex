import { BotServiceData } from 'src/BotService';
import { FilterData, FilterValue } from 'src/filter';
import { Service, ServiceDefinition } from 'src/Service';
import { TemplateScope } from 'src/utils/Template';

// @TODO: fix these good
export type TransformInput = object;
export type TransformOutput = TemplateScope;

export interface TransformData extends BotServiceData {
  filters: Array<ServiceDefinition<FilterData>>;
}

export interface Transform extends Service {
  check(entity: FilterValue): Promise<boolean>;

  transform(entity: FilterValue, type: string, body: TransformInput): Promise<TransformOutput>;
}
