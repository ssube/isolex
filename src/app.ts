import { loadConfig } from '@apextoaster/js-config';
import { signal, SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP } from '@apextoaster/js-utils';
import { CONFIG_SCHEMA, includeSchema } from '@apextoaster/js-yaml-schema';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { BaseOptions, Container, Logger } from 'noicejs';
import { join } from 'path';
import yargs from 'yargs-parser';

import { Bot, BotDefinition } from './Bot';
import { BunyanLogger } from './logger/BunyanLogger';
import { loadModules, mainModules } from './module';
import { BotModule } from './module/BotModule';
import { ServiceModule } from './module/ServiceModule';
import { Schema } from './schema';
import { ServiceEvent } from './Service';
import { removePid, writePid } from './utils/PidFile';
import { VERSION_INFO } from './version';

export interface CreateOptions {
  config: BotDefinition;
  logger: Logger;
}

export const CONFIG_ENV = 'ISOLEX_HOME';

includeSchema.exists = existsSync;
includeSchema.join = join;
includeSchema.read = readFileSync;
includeSchema.resolve = realpathSync;
includeSchema.schema = CONFIG_SCHEMA;

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

export async function main(argv: Array<string>): Promise<ExitStatus> {
  const args = yargs(argv, MAIN_ARGS);
  const config = loadConfig<BotDefinition>(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = BunyanLogger.create(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main starting with arguments');

  const schema = new Schema();
  const result = schema.match(config);
  if (!result.valid) {
    logger.error({ errors: result.errors }, 'config failed to validate');
    return ExitStatus.Error;
  }

  if (args.test === true) {
    logger.info('config is valid');
    return ExitStatus.Success;
  }

  const { bot } = await createBot({ config, logger });
  const status = await runBot({ config, logger }, bot);
  logger.info({ status }, 'main exiting with status');

  return status;
}

export async function createBot(options: CreateOptions) {
  const { config, logger } = options;
  const botModule = new BotModule({ logger });
  const svcModule = new ServiceModule(config.data.services);
  const extModules = await loadModules(config, logger);

  const ctr = Container.from(
    botModule,
    svcModule,
    ...mainModules(),
    ...extModules
  );
  logger.info('configuring container');
  await ctr.configure({ logger });

  const bot = await ctr.create<Bot, BotDefinition & BaseOptions>(Bot, config);
  botModule.setBot(bot);

  return { bot, ctr };
}

async function handleSignals(bot: Bot, logger: Logger) {
  await bot.start();
  await bot.notify(ServiceEvent.Start);

  const signals = [SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP];
  let s = await signal(...signals);
  while (s !== SIGNAL_STOP) {
    switch (s) {
      case SIGNAL_RELOAD:
        await bot.notify(ServiceEvent.Reload);
        break;
      case SIGNAL_RESET:
        await bot.notify(ServiceEvent.Reset);
        break;
      default:
        logger.warn({ signal: s }, 'unknown signal received');
    }
    s = await signal(...signals);
  }

  await bot.notify(ServiceEvent.Stop);
  await bot.stop();
}

export enum ExitStatus {
  Success = 0,
  Error = 1,
}

export async function runBot(options: CreateOptions, bot: Bot): Promise<ExitStatus> {
  const { config, logger } = options;
  logger.info('starting bot');

  let status = ExitStatus.Success;
  await writePid(config.data.process.pid.file);
  try {
    await handleSignals(bot, logger);
  } catch (err) {
    logger.error(err, 'error running bot');
    status = ExitStatus.Error;
  }
  await removePid(config.data.process.pid.file);
  return status;
}
