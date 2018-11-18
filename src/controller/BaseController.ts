import { BaseService } from 'src/BaseService';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Transform } from 'src/transform/Transform';
import { Message } from 'src/entity/Message';

export abstract class BaseController<TConfig extends ControllerConfig> extends BaseService<TConfig> implements Controller {
  public readonly name: string;

  protected readonly transforms: Array<Transform>;

  constructor(options: ControllerOptions<TConfig>) {
    super(options);
  }

  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async check(cmd: Command): Promise<boolean> {
    return cmd.noun === this.name;
  }

  public abstract handle(cmd: Command): Promise<void>;

  protected async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    let data = Message.reply(cmd.toString(), cmd.context);
    for (const transform of this.transforms) {
      const [head, ...rest] = await transform.transform(cmd, data);
      data = head;
      if (rest.length) {
        this.logger.info({ rest }, 'echo transform discarding extra messages');
      }
    }
    return [data];
  }
}
