import * as AWS from 'aws-sdk';
import * as bunyan from 'bunyan';
import { Container } from 'noicejs';
import { Bot, BotModule } from 'src/Bot';
import { loadConfig } from 'src/Config';

const SIGNALS: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM'];
const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

function signal(): Promise<void> {
  return new Promise((res, _) => {
    function handler() {
      for (const sig of SIGNALS) {
        process.removeListener(sig, handler);
      }
      res();
    }

    for (const sig of SIGNALS) {
      process.on(sig, handler);
    }
  });
}

async function main(): Promise<number> {
  const config = await loadConfig();
  const logger = bunyan.createLogger(config.logger);

  const mod = new BotModule({ logger });
  const ctr = Container.from(mod);
  await ctr.configure({ logger });

  const bot = await ctr.create<Bot, any>(Bot, { config });
  mod.setBot(bot);

  await bot.start();
  await signal();
  await bot.stop();

  return STATUS_SUCCESS;
}

main().then((status) => process.exit(status)).catch((err) => {
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});
