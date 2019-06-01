import { isString } from 'lodash';

import { FilterValue } from 'src/filter';
import { Transform } from 'src/transform';
import { MapLike, mapToDict, setOrPush } from 'src/utils/Map';
import { TemplateScope } from 'src/utils/Template';

export async function applyTransforms(
  transforms: Array<Transform>,
  entity: FilterValue,
  type: string,
  body: TemplateScope,
): Promise<TemplateScope> {
  if (transforms.length === 0) {
    return body;
  }

  let result = body;
  for (const transform of transforms) {
    const check = await transform.check(entity);
    if (check) {
      result = await transform.transform(entity, type, result);
    }
  }

  return result;
}

export function scopeToData(scope: TemplateScope): MapLike<Array<string>> {
  const data = new Map();
  for (const [key, value] of Object.entries(scope)) {
    if (isString(value)) {
      setOrPush(data, key, value);
    } else if (Array.isArray(value)) {
      setOrPush(data, key, value);
    } else {
      setOrPush(data, key, JSON.stringify(value));
    }
  }
  return mapToDict(data);
}