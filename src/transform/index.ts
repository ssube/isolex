import { defaultWhen, entriesOf, makeDict, mergeMap } from '@apextoaster/js-utils';
import { BaseError } from 'noicejs';

import { BotServiceData } from '../BotService';
import { FilterData, FilterValue } from '../filter';
import { Service, ServiceDefinition } from '../Service';
import { TemplateScope } from '../utils/Template';

// @TODO: fix these good
/* eslint-disable-next-line @typescript-eslint/ban-types */
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
  let first = true;

  const output = new Map();
  for (const transform of transforms) {
    if (await transform.check(entity)) {
      const scope = defaultWhen(first, body, makeDict(output));
      const result = await transform.transform(entity, type, scope);
      const entries = entriesOf(result);

      mergeMap(output, entries);
      first = false;
    }
  }

  return makeDict(output);
}

export function extractBody(data: TransformOutput): string {
  if (!Array.isArray(data.body)) {
    throw new BaseError('final transform did not return body array');
  }

  const [body] = data.body;
  /* eslint-disable-next-line @typescript-eslint/tslint/config */
  if (typeof body !== 'string') {
    throw new BaseError('final transform did not return a string');
  }

  return body;
}
