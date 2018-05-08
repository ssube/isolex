import { BaseService } from 'src/BaseService';
import { Command } from 'src/entity/Command';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';

export abstract class BaseHandler<TConfig extends HandlerConfig> extends BaseService<TConfig> implements Handler {
  protected name: string;

  constructor(options: HandlerOptions<TConfig>) {
    super(options);

    this.name = options.config.name;
  }

  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async check(cmd: Command): Promise<boolean> {
    return cmd.name === this.name;
  }

  public abstract handle(cmd: Command): Promise<void>;
}
