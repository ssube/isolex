import * as AWS from 'aws-sdk';
import {readFileSync} from 'fs';
import { safeLoad } from 'js-yaml';
//import { Client } from 'vendor/so-client';

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

  const reply = await lexText(lexy, {
    botAlias: config.aws.bot.alias,
    botName: config.aws.bot.name,
    inputText: 'this is a test',
    userId: '00000000'
  })
  console.info('reply:', reply);

  /*const client = new Client({
    email: config.stack.creds.email,
    mainRoom: config.stack.rooms[0],
    password: config.stack.creds.password
  });*/

  return STATUS_SUCCESS;
}

main().then((status) => process.exit(status));
