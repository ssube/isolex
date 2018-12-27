import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';
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

@Inject()
export class PickController extends BaseController<PickControllerData> implements Controller {
  protected list: Checklist<string>;

  constructor(options: PickControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-pick', [NOUN_PICK]);

    this.list = new Checklist(options.data.check);
  }

  public async handle(cmd: Command): Promise<void> {
    const count = Number(cmd.getHeadOrDefault(this.data.field.count, this.data.count));
    const data = cmd.get(this.data.field.data).filter((it) => this.list.check(it));
    const list = Picklist.create(...data);
    const puck = list.pick(count);

    this.logger.debug({ count, data, list, puck }, 'picking item');
    return this.reply(cmd.context, puck.join(','));
  }
}
