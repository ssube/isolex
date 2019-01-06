import { isString } from 'lodash';
import { BaseError } from 'noicejs';

import { Context } from 'src/entity/Context';
import { Message, MessageEntityOptions } from 'src/entity/Message';
import { Tick } from 'src/entity/Tick';
import { BaseInterval, BaseIntervalOptions } from 'src/interval/BaseInterval';
import { IntervalData } from 'src/interval/Interval';
import { ServiceDefinition } from 'src/Service';
import { applyTransforms } from 'src/transform/helpers';
import { Transform, TransformData } from 'src/transform/Transform';

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

  public async tick(context: Context, last: Tick): Promise<number> {
    const initial = new Message({
      ...this.data.defaultMessage,
      context,
    });

    const body = await applyTransforms(this.transforms, initial, this.data.defaultMessage.type, last);
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
