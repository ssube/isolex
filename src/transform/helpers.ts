import { Transform, TransformInput, TransformOutput } from '.';
import { FilterValue } from '../filter';
import { makeDict, MapLike, setOrPush } from '../utils/Map';
import { TemplateScope } from '../utils/Template';

export async function applyTransforms(
  transforms: Array<Transform>,
  entity: FilterValue,
  type: string,
  body: TransformInput
): Promise<TransformOutput> {
  if (transforms.length === 0) {
    return {};
  }

  // @TODO: remove this cast
  let result = body as TransformOutput;
  for (const transform of transforms) {
    const check = await transform.check(entity);
    if (check) {
      result = await transform.transform(entity, type, result);
    }
  }

  return result;
}

/**
 * Convert a template scope (before or after rendering) into suitable data for
 * a Command or Message.
 *
 * This helper exists to mask some Dict/Map inconsistencies that should be
 * resolved elsewhere.
 *
 * @TODO: handle strings, arrays, and nested objects differently
 */
export function scopeToData(scope: TemplateScope): MapLike<Array<string>> {
  const data = new Map();
  for (const [key, value] of Object.entries(scope)) {
    setOrPush(data, key, value);
  }
  return makeDict(data);
}
