import { BaseOptions, Container, Inject, Logger, Module } from 'noicejs';
import yargs from 'yargs-parser';

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
import { Bot, BotData, BotDefinition } from './Bot';
import { BotService } from './BotService';
import { loadConfig } from './config';
import { BaseController } from './controller/BaseController';
import { BaseEndpoint } from './endpoint/BaseEndpoint';
import { BaseFilter } from './filter/BaseFilter';
import { BaseInterval } from './interval/BaseInterval';
import { BaseListener } from './listener/BaseListener';
import { BaseModule } from './module/BaseModule';
import { BotModule } from './module/BotModule';
import { ControllerModule } from './module/ControllerModule';
import { EndpointModule } from './module/EndpointModule';
import { EntityModule } from './module/EntityModule';
import { FilterModule } from './module/FilterModule';
import { IntervalModule } from './module/IntervalModule';
import { ListenerModule } from './module/ListenerModule';
import { MigrationModule } from './module/MigrationModule';
import { ParserModule } from './module/ParserModule';
import { ServiceModule } from './module/ServiceModule';
import { TransformModule } from './module/TransformModule';
import { BaseParser } from './parser/BaseParser';
import { Schema } from './schema';
import { ServiceDefinition, ServiceEvent } from './Service';
import { BaseTransform } from './transform/BaseTransform';
import { BunyanLogger } from './utils/BunyanLogger';
import { ModuleCtor } from './utils/ExternalModule';
import { removePid, writePid } from './utils/PidFile';
import { signal, SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP } from './utils/Signal';
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

const MAIN_MODULES = [
  ControllerModule,
  EndpointModule,
  EntityModule,
  FilterModule,
  IntervalModule,
  ListenerModule,
  MigrationModule,
  ParserModule,
  TransformModule,
];

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

function mainModules() {
  const modules: Array<Module> = [];

  for (const m of MAIN_MODULES) {
    modules.push(new m());
  }

  return modules;
}

async function loadModules(config: BotDefinition, logger: Logger) {
  const modules: Array<Module> = [];

  for (const p of config.data.modules) {
    try {
      const nodeModule = require(p.require);
      const moduleType = nodeModule[p.export] as ModuleCtor;

      // TODO: verify this is a module constructor before instantiating
      const module = new moduleType(p.data);
      modules.push(module);
    } catch (err) {
      logger.error(err, 'error loading external module', p);
    }
  }

  return modules;
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
    return STATUS_ERROR;
  }

  if (args.test) {
    logger.info('config is valid');
    return STATUS_SUCCESS;
  }

  const botModule = new BotModule({ logger });
  const svcModule = new ServiceModule(config.data.services);
  const extModules = await loadModules(config, logger);

  const ctr = Container.from(
    botModule,
    svcModule,
    ...mainModules(),
    ...extModules,
  );
  logger.info('configuring container');
  await ctr.configure({ logger });

  const bot = await ctr.create<Bot, ServiceDefinition<BotData> & BaseOptions>(Bot, config);
  botModule.setBot(bot);

  logger.info('starting bot');
  await writePid(config.data.process.pid.file);
  await handleSignals(bot, logger);
  await removePid(config.data.process.pid.file);

  return STATUS_SUCCESS;
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});
