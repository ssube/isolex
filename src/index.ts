import * as AWS from 'aws-sdk';
import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { Bot } from 'src/Bot';
import { Event } from 'vendor/so-client/src/events';

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

function signal(): Promise<void> {
  return new Promise((res, rej) => {
    process.on('SIGINT', () => res());
  });
}

async function main(): Promise<number> {
  console.info('hello bot');

  const data = readFileSync('/home/ssube/.isolex.yml', 'utf-8');
  const config = safeLoad(data) as any;

  if (!config) {
    throw new Error('config did not load');
  }

  const bot = new Bot(config);
  await bot.start();
  await signal();

  return STATUS_SUCCESS;
}

main().then((status) => process.exit(status)).catch((err) => {
  console.error('uncaught error:', err);
  process.exit(1);
});
