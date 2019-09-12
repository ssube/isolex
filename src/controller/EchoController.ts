import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { Command, CommandVerb } from '../entity/Command';
import { ChannelData, Context } from '../entity/Context';
import { Listener } from '../listener';
import { ServiceMetadata } from '../Service';
import { doesExist, mustCoalesce } from '../utils';
import { BaseController, BaseControllerOptions } from './BaseController';

export const NOUN_ECHO = 'echo';

export interface EchoControllerData extends ControllerData {
  defaultTarget: ServiceMetadata;
  forceChannel?: ChannelData;
}

@Inject()
export class EchoController extends BaseController<EchoControllerData> implements Controller {
  protected defaultTarget?: Listener;

  constructor(options: BaseControllerOptions<EchoControllerData>) {
    super(options, 'isolex#/definitions/service-controller-echo', [NOUN_ECHO]);
  }

  public async start() {
    await super.start();

    this.defaultTarget = this.services.getService<Listener>(this.data.defaultTarget);
  }

  @Handler(NOUN_ECHO, CommandVerb.Create)
  @CheckRBAC()
  public async createEcho(cmd: Command, ctx: Context): Promise<void> {
    const targetCtx = this.ensureTarget(ctx);

    this.logger.debug({ cmd, ctx, targetCtx }, 'echoing command');

    return this.transformJSON(cmd, {}, targetCtx);
  }

  @Handler(NOUN_ECHO, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }

  protected ensureTarget(ctx: Context) {
    const channel = mustCoalesce(this.data.forceChannel, ctx.channel);

    if (doesExist(ctx.target)) {
      return new Context({
        ...ctx,
        channel,
      });
    }

    return new Context({
      ...ctx,
      channel,
      target: this.defaultTarget,
    });
  }
}
