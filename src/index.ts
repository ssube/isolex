import { Container, Inject, Module } from 'noicejs';
import yargs from 'yargs-parser';

import { createBot, ExitStatus, runBot } from './app';
import {
  BaseService,
  INJECT_CLOCK,
  INJECT_JSONPATH,
  INJECT_LOGGER,
  INJECT_MATH,
  INJECT_METRICS,
  INJECT_REQUEST,
  INJECT_SCHEMA,
  INJECT_SERVICES,
  INJECT_TEMPLATE,
} from './BaseService';
import { BotService } from './BotService';
import { loadConfig } from './config';
import { BaseController } from './controller/BaseController';
import { BaseEndpoint } from './endpoint/BaseEndpoint';
import { BaseFilter } from './filter/BaseFilter';
import { BaseInterval } from './interval/BaseInterval';
import { BaseListener } from './listener/BaseListener';
import { BaseModule } from './module/BaseModule';
import { BaseParser } from './parser/BaseParser';
import { Schema } from './schema';
import { BaseTransform } from './transform/BaseTransform';
import { BunyanLogger } from './utils/BunyanLogger';
import { VERSION_INFO } from './version';

// re-exports
export const base = {
  BaseController,
  BaseEndpoint,
  BaseFilter,
  BaseInterval,
  BaseListener,
  BaseModule,
  BaseParser,
  BaseService,
  BaseTransform,
  BotService,
};
export const inject = {
  INJECT_CLOCK,
  INJECT_JSONPATH,
  INJECT_LOGGER,
  INJECT_MATH,
  INJECT_METRICS,
  INJECT_REQUEST,
  INJECT_SCHEMA,
  INJECT_SERVICES,
  INJECT_TEMPLATE,
};
export const noicejs = {
  Container,
  Inject,
  Module,
};

// main arguments
const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';
const MAIN_ARGS: yargs.Options = {
  array: [CONFIG_ARGS_PATH],
  boolean: ['test'],
  count: ['v'],
  default: {
    [CONFIG_ARGS_NAME]: '.isolex.yml',
    [CONFIG_ARGS_PATH]: [],
  },
  envPrefix: 'isolex',
};

export async function main(argv: Array<string>): Promise<number> {
  const args = yargs(argv, MAIN_ARGS);
  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = BunyanLogger.create(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main arguments');

  const schema = new Schema();
  const result = schema.match(config);
  if (!result.valid) {
    logger.error({ errors: result.errors }, 'config failed to validate');
    return ExitStatus.Error;
  }

  if (args.test) {
    logger.info('config is valid');
    return ExitStatus.Success;
  }

  const { bot } = await createBot({ config, logger });
  return runBot({ config, logger }, bot);
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(ExitStatus.Error);
});
