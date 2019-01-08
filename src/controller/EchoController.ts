import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';

export const NOUN_ECHO = 'echo';

export type EchoControllerData = ControllerData;
export type EchoControllerOptions = BaseControllerOptions<EchoControllerData>;

@Inject()
export class EchoController extends BaseController<EchoControllerData> implements Controller {
  constructor(options: EchoControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-echo', [NOUN_ECHO]);
  }

  @Handler(NOUN_ECHO, CommandVerb.Create)
  @CheckRBAC()
  public async createEcho(cmd: Command, ctx: Context): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');
    return this.transformJSON(cmd, {});
  }

  @Handler(NOUN_ECHO, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}
