import { main } from './app';

const STATUS_ERROR = 1;

/**
 * This is the main entry-point to the program and the only file not included in the main bundle.
 */
main(process.argv).then((status) => process.exit(status)).catch((err: Error) => {
  // eslint-disable-next-line no-console
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});
