import { constructorName } from '@apextoaster/js-utils';
import bunyan from 'bunyan';
import { Logger } from 'noicejs';

/**
 * Attach bunyan to the Logger. Does very little, since bunyan matches the Logger interface.
 */
export class BunyanLogger {
  public static create(options: bunyan.LoggerOptions): Logger {
    return bunyan.createLogger({
      ...options,
      serializers: {
        ...bunyan.stdSerializers,
        container: constructorName,
        logger: constructorName,
        module: constructorName,
      },
    });
  }
}
