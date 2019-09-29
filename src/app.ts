import { BaseOptions, Container, Logger } from 'noicejs';

import { Bot, BotDefinition } from './Bot';
import { loadModules, mainModules } from './module';
import { BotModule } from './module/BotModule';
import { ServiceModule } from './module/ServiceModule';
import { ServiceEvent } from './Service';
import { removePid, writePid } from './utils/PidFile';
import { signal, SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP } from './utils/Signal';

export interface CreateOptions {
  config: BotDefinition;
  logger: Logger;
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

  await writePid(config.data.process.pid.file);
  await handleSignals(bot, logger);
  await removePid(config.data.process.pid.file);

  return ExitStatus.Success;
}
