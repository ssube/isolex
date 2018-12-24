declare module "@octokit/graphql" {
  export interface RequestOptions {
    [key: string]: string | {};
    headers: {
      [key: string]: string;
    }
  }

  export interface GraphClient {
    (query: string, options: Partial<RequestOptions>): Promise<any>;
  }

  export function defaults(options: RequestOptions): GraphClient;
}
