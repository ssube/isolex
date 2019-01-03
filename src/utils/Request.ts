import * as request from 'request-promise-native';

export type RequestOptions = request.Options;

/**
 * Work around for the lack of existing create method (default export is the function).
 *
 * Since each user needs to create requests with typed options, the container needs to inject an instance of
 * something (this).
 */
export class RequestFactory {
  public create(options: RequestOptions): Promise<any> {
    return request(options).promise();
  }
}
