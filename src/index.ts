import * as AWS from 'aws-sdk';
import { Container } from 'noicejs';
import { Bot, BotModule } from 'src/Bot';
import { loadConfig } from 'src/Config';
import { Event } from 'vendor/so-client/src/events';

const SIGNALS: Array<NodeJS.Signals> = ['SIGINT', 'SIGKILL'];
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
  const mod = new BotModule();
  const ctr = Container.from(mod);
  await ctr.configure();

  const config = await loadConfig();
  const bot = await ctr.create<Bot, any>(Bot, {config});
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
