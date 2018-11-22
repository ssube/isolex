import { BaseService } from 'src/BaseService';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseError } from 'src/error/BaseError';
import { ServiceDefinition } from 'src/Service';
import { Transform, TransformData } from 'src/transform/Transform';

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
    let batch = [input];
    for (const transform of this.transforms) {
      const next = [];
      for (const msg of batch) {
        const result = await transform.transform(cmd, msg);
        next.push(...result);
      }
      batch = next;
    }
    return batch;
  }
}
