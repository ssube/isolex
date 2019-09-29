import { ConsoleLogger, Logger, NullLogger } from 'noicejs';

const ENV_DEBUG = 'DEBUG';

export function getTestLogger(verbose = false): Logger {
  if (verbose || process.env[ENV_DEBUG] === 'TRUE') {
    return new ConsoleLogger();
  } else {
    return new NullLogger();
  }
}
