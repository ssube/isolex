import { JSONPath } from 'jsonpath-plus';

import { TemplateScope } from './Template';

export class JsonPath {
  public query(json: TemplateScope, path: string, count?: number): Array<TemplateScope> {
    return JSONPath({json, path});
  }
}
