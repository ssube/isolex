import yargs from 'yargs-parser';

// main arguments
export const CONFIG_ARGS_NAME = 'config-name';
export const CONFIG_ARGS_PATH = 'config-path';
export const CONFIG_ARGS: yargs.Options = {
  array: [CONFIG_ARGS_PATH],
  boolean: ['test'],
  count: ['v'],
  default: {
    [CONFIG_ARGS_NAME]: '.isolex.yml',
    [CONFIG_ARGS_PATH]: [],
  },
  envPrefix: 'isolex',
};
