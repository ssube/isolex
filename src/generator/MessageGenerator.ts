import { GeneratorData } from '.';
import { Context } from '../entity/Context';
import { Message, MessageEntityOptions } from '../entity/Message';
import { Tick } from '../entity/Tick';
import { NotInitializedError } from '../error/NotInitializedError';
import { ServiceDefinition } from '../Service';
import { applyTransforms, extractBody, Transform, TransformData } from '../transform';
import { BaseGenerator, BaseGeneratorOptions } from './BaseGenerator';

export interface MessageGeneratorData extends GeneratorData {
  defaultMessage: MessageEntityOptions;
  transforms: Array<ServiceDefinition<TransformData>>;
}

export class MessageGenerator extends BaseGenerator<MessageGeneratorData> {
  protected started: boolean;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseGeneratorOptions<MessageGeneratorData>) {
    super(options, 'isolex#/definitions/service-generator-message');

    this.started = false;
    this.transforms = [];
  }

  public async start() {
    await super.start();

    for (const def of this.data.transforms) {
      const transform = await this.services.createService<Transform, TransformData>(def);
      this.transforms.push(transform);
    }

    this.started = true;
  }

  public async stop() {
    this.started = false;
    this.transforms.length = 0;

    return super.stop();
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    if (this.started === false) {
      throw new NotInitializedError('message interval has not been started');
    }

    const initial = new Message({
      ...this.data.defaultMessage,
      context,
    });

    const result = await applyTransforms(this.transforms, initial, this.data.defaultMessage.type, {
      last,
      next,
    });

    const body = extractBody(result);
    await this.bot.sendMessage(new Message({
      ...initial,
      body,
    }));
    return 0;
  }
}
