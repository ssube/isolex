import * as jp from 'jsonpath';

import { TemplateScope } from 'src/utils/Template';

export class JsonPath {
  public query(data: TemplateScope, path: string, count?: number): Array<TemplateScope> {
    return jp.query(data, path, count);
  }
}
