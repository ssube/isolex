import { Container, Module } from 'noicejs';
import * as sourceMapSupport from 'source-map-support';
import { Bot } from 'src/Bot';
import { loadConfig } from 'src/config';
import { BotModule } from 'src/module/BotModule';
import { MigrationModule } from 'src/module/MigrationModule';
import { signal } from 'src/utils';
import { BunyanLogger } from 'src/utils/BunyanLogger';

sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: true,
  hookRequire: true
});

const SIGNAL_RELOAD: Array<NodeJS.Signals> = ['SIGHUP'];
const SIGNAL_STOP: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM'];
const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

async function main(): Promise<number> {
  const config = await loadConfig();
  const logger = BunyanLogger.create(config.logger);

  const botModule = new BotModule({ logger });
  const mod: Array<Module> = [botModule];

  if (config.migrate) {
    mod.push(new MigrationModule());
  }

  const ctr = Container.from(...mod);
  await ctr.configure({ logger });

  const bot = await ctr.create<Bot, any>(Bot, { config });
  botModule.setBot(bot);

  await bot.start();
  await signal(SIGNAL_STOP);
  await bot.stop();

  return STATUS_SUCCESS;
}

main().then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});
