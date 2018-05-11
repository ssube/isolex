import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';

export interface ServiceConfig {
  name: string;
}

export interface ServiceOptions<TConfig extends ServiceConfig> extends BaseOptions {
  bot: Bot;
  config: TConfig;
  logger: Logger;
}

export interface Service {
  readonly id: string;
  readonly name: string;

  start(): Promise<void>;
  stop(): Promise<void>;
}
