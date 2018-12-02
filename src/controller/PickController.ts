import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';
import { TYPE_TEXT } from 'src/utils/Mime';
import { Picklist } from 'src/utils/Picklist';

export interface PickControllerData extends ControllerData {
  check: ChecklistOptions<string>;
  count: string;
  field: {
    count: string;
    data: string;
  };
}

export const NOUN_PICK = 'pick';

export type PickControllerOptions = ControllerOptions<PickControllerData>;

export class PickController extends BaseController<PickControllerData> implements Controller {
  protected list: Checklist<string>;

  constructor(options: PickControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_PICK],
    });

    this.list = new Checklist(options.data.check);
  }

  public async handle(cmd: Command): Promise<void> {
    const count = Number(cmd.getHeadOrDefault(this.data.field.count, this.data.count));
    const data = cmd.get(this.data.field.data).filter((it) => this.list.check(it));
    const list = Picklist.create(...data);
    const puck = list.pick(count);

    this.logger.debug({ count, data, list, puck }, 'picking item');
    return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, puck.join(',')));
  }
}
