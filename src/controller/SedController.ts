import { isNil } from 'lodash';
import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { Message } from '../entity/Message';
import { doesExist, mustExist } from '../utils';
import { BaseController, BaseControllerOptions } from './BaseController';

export type SedControllerData = ControllerData;

export const NOUN_SED = 'sed';

@Inject()
export class SedController extends BaseController<SedControllerData> implements Controller {
  constructor(options: BaseControllerOptions<SedControllerData>) {
    super(options, 'isolex#/definitions/service-controller-sed', [NOUN_SED]);
  }

  @Handler(NOUN_SED, CommandVerb.Create)
  @CheckRBAC()
  public async createSed(cmd: Command, ctx: Context): Promise<void> {
    const source = this.getSourceOrFail(ctx);
    const expr = cmd.getHead('expr');

    // split into regex, replace and flags
    const parts = expr.match(/\/((?:[^\\]|\\.)*)\/((?:[^\\]|\\.)*)\/([gmiuy]*)/);
    if (isNil(parts)) {
      this.logger.debug({ expr }, 'invalid input.');
      return this.reply(ctx, this.translate(ctx, 'create.invalid'));
    }

    this.logger.debug({ parts }, 'fetching messages');
    try {
      const messages = await this.bot.fetch({
        channel: ctx.channel.id,
        listenerId: source.id,
        useFilters: true,
      });

      for (const message of messages) {
        if (await this.processMessage(message, cmd, parts)) {
          return;
        }
      }

      return this.reply(ctx, this.translate(ctx, 'create.missing'));
    } catch (err) {
      this.logger.error(err, 'Failed to fetch messages.');
    }
  }

  @Handler(NOUN_SED, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }

  private async processMessage(message: Message, command: Command, parts: RegExpMatchArray): Promise<boolean> {
    if (doesExist(message.context) && doesExist(command.context) && message.context.channel.thread !== command.context.channel.thread) {
      return false;
    }

    const ctx = mustExist(command.context);
    const [/* input */, pattern, replacement, flags] = parts;
    const expr = new RegExp(pattern, flags);
    if (expr.test(message.body)) {
      const body = message.body.replace(expr, replacement);
      await this.reply(ctx, body);
      return true;
    }

    return false;
  }
}
