import { BaseService } from 'src/BaseService';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseError } from 'src/error/BaseError';
import { Transform, TransformData } from 'src/transform/Transform';
import { ServiceDefinition } from 'src/Service';

export abstract class BaseController<TData extends ControllerData> extends BaseService<TData> implements Controller {
  public readonly name: string;

  protected readonly transforms: Array<Transform>;

  constructor(options: ControllerOptions<TData>) {
    super(options);

    this.transforms = [];
  }

  public async start() {
    const transforms: Array<ServiceDefinition<TransformData>> = this.data.transforms || [];
    for (const def of transforms) {
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
      if (!Message.isMessage(head)) {
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
