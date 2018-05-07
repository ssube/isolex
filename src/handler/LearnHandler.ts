import { Command } from 'src/entity/Command';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { ServiceOptions } from 'src/Service';

export interface LearnHandlerConfig extends HandlerConfig {
  emit: string;
}

export type LearnHandlerOptions = HandlerOptions<LearnHandlerConfig>;

export class LearnHandler extends BaseHandler<LearnHandlerConfig> implements Handler {
  constructor(options: LearnHandlerOptions) {
    super(options);
  }

  public async check(cmd: Command): Promise<boolean> {
    return true;
  }

  public async handle(cmd: Command): Promise<void> {

  }
}
