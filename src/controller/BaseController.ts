import { BaseService } from 'src/BaseService';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseError } from 'src/error/BaseError';
import { Transform } from 'src/transform/Transform';

export abstract class BaseController<TConfig extends ControllerConfig> extends BaseService<TConfig> implements Controller {
  public readonly name: string;

  protected readonly transforms: Array<Transform>;

  constructor(options: ControllerOptions<TConfig>) {
    super(options);

    this.transforms = [];
  }

  public async start() {
    for (const def of this.data.transforms) {
      const transform = await this.bot.createService<Transform, any>(def);
      this.transforms.push(transform);
    }
  }

  public async stop() {
    /* noop */
  }

  public async check(cmd: Command): Promise<boolean> {
    return cmd.noun === this.name;
  }

  public abstract handle(cmd: Command): Promise<void>;

  protected async transform(cmd: Command, input: Message): Promise<Array<Message>> {
    let data = input;
    for (const transform of this.transforms) {
      const [head, ...rest] = await transform.transform(cmd, data);
      if (Message.isMessage(head)) {
        const err = new BaseError('misbehaving transform returned something other than a message');
        this.logger.error(err, 'misbehaving transform');
        throw err;
      }

      data = head;
      if (rest.length) {
        this.logger.info({ rest }, 'echo transform discarding extra messages');
      }
    }
    return [data];
  }
}
