import * as request from 'request';

export type RequestOptions = request.CoreOptions & request.UriOptions;

/**
 * Work around for the lack of existing create method (default export is the function).
 *
 * Since each user needs to create requests with typed options, the container needs to inject an instance of
 * something (this).
 */
export class RequestFactory {
  public create(options: RequestOptions): Promise<any> {
    return new Promise((res, rej) => {
      request(options, (err: Error, response: request.Response, body: unknown) => {
        if (err) {
          rej(err);
        } else {
          res(body);
        }
      });
    });
  }
}
