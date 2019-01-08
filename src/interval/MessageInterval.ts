import { isString } from 'lodash';
import { BaseError } from 'noicejs';

import { Context } from 'src/entity/Context';
import { Message, MessageEntityOptions } from 'src/entity/Message';
import { Tick } from 'src/entity/Tick';
import { IntervalData } from 'src/interval';
import { BaseInterval, BaseIntervalOptions } from 'src/interval/BaseInterval';
import { ServiceDefinition } from 'src/Service';
import { Transform, TransformData } from 'src/transform';
import { applyTransforms } from 'src/transform/helpers';

export interface MessageIntervalData extends IntervalData {
  defaultMessage: MessageEntityOptions;
  transforms: Array<ServiceDefinition<TransformData>>;
}

export type MessageIntervalOptions = BaseIntervalOptions<MessageIntervalData>;

export class MessageInterval extends BaseInterval<MessageIntervalData> {
  protected readonly transforms: Array<Transform>;

  constructor(options: MessageIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-message');

    this.transforms = [];
  }

  public async start() {
    await super.start();

    const transforms: Array<ServiceDefinition<TransformData>> = this.data.transforms;
    for (const def of transforms) {
      const transform = await this.services.createService<Transform, TransformData>(def);
      this.transforms.push(transform);
    }
  }

  public async stop() {
    this.transforms.length = 0;

    return super.stop();
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    const initial = new Message({
      ...this.data.defaultMessage,
      context,
    });

    const body = await applyTransforms(this.transforms, initial, this.data.defaultMessage.type, {
      last,
      next,
    });
    if (!isString(body)) {
      throw new BaseError('final transform did not return a string');
    }

    await this.bot.sendMessage(new Message({
      ...initial,
      body,
    }));
    return 0;
  }
}
