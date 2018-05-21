import { Inject } from 'noicejs';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Picklist } from '../utils/Picklist';
import { Checklist, ChecklistOptions } from '../utils/Checklist';
import { Check } from 'typeorm';

export interface PickHandlerConfig extends HandlerConfig {
  check: ChecklistOptions<string>;
  count: string;
  field: {
    count: string;
    data: string;
  };
}

export type PickHandlerOptions = HandlerOptions<PickHandlerConfig>;

export class PickHandler extends BaseHandler<PickHandlerConfig> implements Handler {
  protected list: Checklist<string>;

  constructor(options: PickHandlerOptions) {
    super(options);

    this.list = new Checklist(options.config.check);
  }

  public async handle(cmd: Command): Promise<void> {
    const count = Number(cmd.getHeadOrDefault(this.config.field.count, this.config.count));
    const data = cmd.get(this.config.field.data).filter((it) => this.list.check(it));
    const list = Picklist.create(...data);
    const puck = list.pick(count);

    this.logger.debug({ count, data, list, puck }, 'picking item');
    return this.bot.send(Message.reply(puck.join(','), cmd.context));
  }
}
