declare module 'jsonpath-plus' {
  export interface JSONPathOptions {
    json: any;
    path: string;
  }

  export function JSONPath(options: JSONPathOptions): any;
}