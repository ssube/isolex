import { BotServiceData } from '../BotService';
import { FilterData, FilterValue } from '../filter';
import { Service, ServiceDefinition } from '../Service';
import { defaultWhen } from '../utils';
import { entriesOf, makeDict } from '../utils/Map';
import { TemplateScope } from '../utils/Template';

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

export async function applyTransforms(
  transforms: Array<Transform>,
  entity: FilterValue,
  type: string,
  body: TransformInput
): Promise<TransformOutput> {
  const applicable = await Promise.all(transforms.filter((tx) => tx.check(entity)));
  const [firstTx] = applicable;

  const output = new Map();
  for (const transform of applicable) {
    const scope = defaultWhen(transform === firstTx, body, makeDict(output));
    const result = await transform.transform(entity, type, scope);
    const entries = entriesOf(result);

    for (const [k, v] of entries) {
      output.set(k, v);
    }
  }

  return makeDict(output);
}
