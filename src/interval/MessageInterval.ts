import { isString } from 'lodash';
import { BaseError } from 'noicejs';

import { IntervalData } from '.';
import { Context } from '../entity/Context';
import { Message, MessageEntityOptions } from '../entity/Message';
import { Tick } from '../entity/Tick';
import { ServiceDefinition } from '../Service';
import { Transform, TransformData } from '../transform';
import { applyTransforms } from '../transform/helpers';
import { BaseInterval, BaseIntervalOptions } from './BaseInterval';

export interface MessageIntervalData extends IntervalData {
  defaultMessage: MessageEntityOptions;
  transforms: Array<ServiceDefinition<TransformData>>;
}

export class MessageInterval extends BaseInterval<MessageIntervalData> {
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseIntervalOptions<MessageIntervalData>) {
    super(options, 'isolex#/definitions/service-interval-message');

    this.transforms = [];
  }

  public async start() {
    await super.start();

    for (const def of this.data.transforms) {
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
    if (!isString(body.body)) {
      throw new BaseError('final transform did not return a string');
    }

    await this.bot.sendMessage(new Message({
      ...initial,
      body: body.body,
    }));
    return 0;
  }
}
