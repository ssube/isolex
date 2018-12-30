import { Context } from 'src/entity/Context';
import { Message, MessageOptions } from 'src/entity/Message';
import { Tick } from 'src/entity/Tick';
import { BaseInterval } from 'src/interval/BaseInterval';
import { IntervalData, IntervalOptions } from 'src/interval/Interval';

export interface MessageIntervalData extends IntervalData {
  defaultMessage: MessageOptions;
}

export type MessageIntervalOptions = IntervalOptions<MessageIntervalData>;

export class MessageInterval extends BaseInterval<MessageIntervalData> {
  constructor(options: MessageIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-message');
  }

  public async tick(context: Context, last: Tick): Promise<number> {
    const msg = new Message({
      ...this.data.defaultMessage,
      context,
    });
    await this.bot.sendMessage(msg);
    return 0;
  }
}
