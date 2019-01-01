import * as request from 'request';

/**
 * Work around for the lack of existing create method (default export is the function).
 *
 * Since each user needs to create requests with typed options, the container needs to inject an instance of
 * something (this).
 */
export class RequestFactory {
  public create(options: request.Options): Promise<any> {
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
