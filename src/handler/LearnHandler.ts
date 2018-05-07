import { Command } from 'src/entity/Command';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler } from 'src/handler/Handler';
import { ServiceOptions } from 'src/Service';

export interface LearnHandlerConfig {
  emit: string;
  name: string;
}

export type LearnHandlerOptions = ServiceOptions<LearnHandlerConfig>;

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
