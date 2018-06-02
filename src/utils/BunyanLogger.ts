import * as bunyan from 'bunyan';
import { prototypeName } from 'src/utils';

/**
 * Attach bunyan to the Logger. Does very little, since bunyan matches the Logger interface.
 */
export class BunyanLogger {
  public static create(options: bunyan.LoggerOptions) {
    return bunyan.createLogger({
      ...options,
      serializers: {
        ...bunyan.stdSerializers,
        logger: prototypeName,
        module: prototypeName,
      },
    });
  }
}
