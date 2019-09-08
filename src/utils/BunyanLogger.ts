import bunyan from 'bunyan';
import { Logger } from 'noicejs';

import { prototypeName } from '.';

/**
 * Attach bunyan to the Logger. Does very little, since bunyan matches the Logger interface.
 */
export class BunyanLogger {
  public static create(options: bunyan.LoggerOptions): Logger {
    return bunyan.createLogger({
      ...options,
      serializers: {
        ...bunyan.stdSerializers,
        container: prototypeName,
        logger: prototypeName,
        module: prototypeName,
      },
    });
  }
}
