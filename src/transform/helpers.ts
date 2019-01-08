import { FilterValue } from 'src/filter';
import { Transform } from 'src/transform/Transform';
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
