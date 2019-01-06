import { isNil } from 'lodash';
import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { doesExist, mustExist } from 'src/utils';

export type SedControllerData = ControllerData;
export type SedControllerOptions = ControllerOptions<SedControllerData>;

export const NOUN_SED = 'sed';

@Inject()
export class SedController extends BaseController<SedControllerData> implements Controller {
  constructor(options: SedControllerOptions) {
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
      return this.reply(ctx, this.locale.translate('service.controller.sed.invalid'));
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

      return this.reply(ctx, this.locale.translate('service.controller.sed.missing'));
    } catch (error) {
      this.logger.error('Failed to fetch messages.');
    }
  }

  private async processMessage(message: Message, command: Command, parts: RegExpMatchArray): Promise<boolean> {
    if (doesExist(message.context) && doesExist(command.context) && message.context.channel.thread === command.context.channel.thread) {
      return false;
    }

    const ctx = mustExist(command.context);
    const [_, pattern, replacement, flags] = parts;
    const expr = new RegExp(pattern, flags);
    if (expr.test(message.body)) {
      const body = message.body.replace(expr, replacement);
      await this.reply(ctx, body);
      return true;
    }

    return false;
  }
}
