import { Container } from 'noicejs';
import { Bot } from 'src/Bot';
import { loadConfig } from 'src/config';
import { BotModule } from 'src/module/BotModule';
import { signal } from 'src/utils';
import { BunyanLogger } from 'src/utils/BunyanLogger';

const SIGNAL_RELOAD: Array<NodeJS.Signals> = ['SIGHUP'];
const SIGNAL_STOP: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM'];
const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

async function main(): Promise<number> {
  const config = await loadConfig();
  const logger = BunyanLogger.create(config.logger);

  const mod = new BotModule({ logger });
  const ctr = Container.from(mod);
  await ctr.configure({ logger });

  const bot = await ctr.create<Bot, any>(Bot, { config });
  mod.setBot(bot);

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
