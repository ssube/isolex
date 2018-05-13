import * as bunyan from 'bunyan';
import { stdSerializers } from 'bunyan';
import { Logger } from 'noicejs';
import { prototypeName } from 'src/utils';

/**
 * Attach bunyan to the Logger. Does very little, since bunyan matches the Logger interface.
 */
export class BunyanLogger {
  public static create(options: bunyan.LoggerOptions) {
    return bunyan.createLogger({
      ...options,
      serializers: {
        ...stdSerializers,
        logger: prototypeName,
        module: prototypeName
      }
    });
  }
}
