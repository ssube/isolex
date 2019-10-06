import { BaseOptions } from 'noicejs';
import request from 'request-promise-native';

export type RequestOptions = request.Options;

/**
 * Work around for the lack of existing create method (default export is the function).
 *
 * Since each user needs to create requests with typed options, the container needs to inject an instance of
 * something (this).
 */
export class RequestFactory {
  protected r: typeof request;

  constructor(options: BaseOptions, r = request) {
    this.r = r;
  }

  public create<T>(options: RequestOptions): Promise<T> {
    return this.r(options).promise();
  }
}
