import { BotServiceData } from '../BotService';
import { FilterData, FilterValue } from '../filter';
import { Service, ServiceDefinition } from '../Service';
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
  const output = new Map();

  const [headTx] = transforms;
  for (const transform of transforms) {
    const check = await transform.check(entity);
    if (check) {
      const scope = transform === headTx ? body : makeDict(output);
      const result = await transform.transform(entity, type, scope);
      const entries = entriesOf(result);

      for (const [k, v] of entries) {
        output.set(k, v);
      }
    }
  }

  return makeDict(output);
}
