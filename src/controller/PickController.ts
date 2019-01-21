import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
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

@Inject()
export class PickController extends BaseController<PickControllerData> implements Controller {
  protected list: Checklist<string>;

  constructor(options: BaseControllerOptions<PickControllerData>) {
    super(options, 'isolex#/definitions/service-controller-pick', [NOUN_PICK]);

    this.list = new Checklist(options.data.check);
  }

  @Handler(NOUN_PICK, CommandVerb.Get)
  @CheckRBAC()
  public async getPick(cmd: Command, ctx: Context): Promise<void> {
    const count = Number(cmd.getHeadOrDefault(this.data.field.count, this.data.count));
    const data = cmd.get(this.data.field.data).filter((it) => this.list.check(it));
    const list = Picklist.create(...data);
    const puck = list.pick(count);

    this.logger.debug({ count, data, list, puck }, 'picking item');
    return this.reply(ctx, puck.join(','));
  }

  @Handler(NOUN_PICK, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}
