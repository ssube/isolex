import * as AWS from 'aws-sdk';
import {readFileSync} from 'fs';
import { safeLoad } from 'js-yaml';
import { Client } from 'vendor/so-client/src/client';
import { Event } from 'vendor/so-client/src/events';

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

async function lexText(client: AWS.LexRuntime, params: AWS.LexRuntime.PostTextRequest): Promise<any> {
  return new Promise((res, rej) => {
    client.postText(params, (err, reply) => {
      if (err) {
        rej(err);
      } else {
        res(reply);
      }
    });
  });
}

function padUserId(id: number) {
  const fixed = id.toFixed(0);
  if (fixed.length < 8) {
    const pre = Array(8 - fixed.length).fill('0').join('');
    return `${pre}${fixed}`;
  } else {
    return fixed;
  }
}

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

  const creds = new AWS.Credentials(config.aws.creds.access_key, config.aws.creds.secret_key);
  const lexy = new AWS.LexRuntime({
    credentials: creds,
    region: config.aws.region
  });

  const client = new Client({
    email: config.stack.creds.email,
    mainRoom: config.stack.room,
    password: config.stack.creds.password
  });

  client.on('debug', (...args: Array<any>) => console.debug('client debug', ...args));
  client.on('open', () => console.info('client connected'));
  client.on('close', () => console.info('client disconnected'));

  await client.auth();
  await client.join();

  client.on('event', async (event: Event) => {
    if (event.event_type === 1) {
      console.log('message:', event.user_name, event.content);

      if (event.content.includes(config.stack.bot.prefix)) {
        try {
          const reply = await lexText(lexy, {
            botAlias: config.aws.bot.alias,
            botName: config.aws.bot.name,
            inputText: event.content,
            userId: padUserId(event.user_id)
          });

          console.debug('reply:', reply);

          await client.send(`@${event.user_name}: ${reply.message} (${reply.intentName} ${reply.dialogState})`, config.stack.room);

          console.debug('reply sent');
        } catch (err) {
          console.error('reply error', err);
        }
      }
    }
  });

  await signal();

  return STATUS_SUCCESS;
}

main().then((status) => process.exit(status)).catch((err) => {
  console.error('uncaught error:', err);
  process.exit(1);
});
