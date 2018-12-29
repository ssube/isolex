import { Context } from 'src/entity/Context';
import { Message, MessageOptions } from 'src/entity/Message';
import { BaseInterval } from 'src/interval/BaseInterval';
import { IntervalData, IntervalJob, IntervalOptions } from 'src/interval/Interval';

export interface MessageIntervalData extends IntervalData {
  defaultMessage: MessageOptions;
}

export type MessageIntervalOptions = IntervalOptions<MessageIntervalData>;

export class MessageInterval extends BaseInterval<MessageIntervalData> {
  constructor(options: MessageIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-message');
  }

  public async tick(context: Context, last: IntervalJob): Promise<number> {
    const msg = new Message({
      ...this.data.defaultMessage,
      body: `last fired: ${last.createdAt}`,
      context,
    });
    await this.bot.sendMessage(msg);
    return 0;
  }
}
