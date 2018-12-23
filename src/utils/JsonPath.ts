import * as jp from 'jsonpath';

export class JsonPath {
  public query(data: any, path: string, count?: number): Array<any> {
    return jp.query(data, path, count);
  }
}
