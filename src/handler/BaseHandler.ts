import { Command } from 'src/entity/Command';
import { Handler } from 'src/handler/Handler';
import { BaseService } from 'src/Service';

export abstract class BaseHandler<TConfig> extends BaseService<TConfig> implements Handler {
  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public abstract check(cmd: Command): Promise<boolean>;
  public abstract handle(cmd: Command): Promise<void>;
}
