import { Inject } from 'noicejs';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';

export type SedControllerData = ControllerData;
export type SedControllerOptions = ControllerOptions<SedControllerData>;

export const NOUN_SED = 'sed';

@Inject()
export class SedController extends BaseController<SedControllerData> implements Controller {
  constructor(options: SedControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-sed', [NOUN_SED]);
  }

  @HandleNoun(NOUN_SED)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
  public async createSed(cmd: Command): Promise<void> {
    const source = this.getSourceOrFail(cmd.context);
    const expr = cmd.getHead('expr');

    // split into regex, replace and flags
    const parts = expr.match(/\/((?:[^\\]|\\.)*)\/((?:[^\\]|\\.)*)\/([gmiuy]*)/);
    if (!parts) {
      this.logger.debug({ expr }, 'invalid input.');
      return this.reply(cmd.context, 'invalid input. Please use \`!!s/e/d/[flags]\`');
    }

    this.logger.debug({ parts }, 'fetching messages');
    try {
      const messages = await this.bot.fetch({
        channel: cmd.context.channel.id,
        listenerId: source.id,
        useFilters: true,
      });

      for (const message of messages) {
        if (await this.processMessage(message, cmd, parts)) {
          return;
        }
      }

      return this.reply(cmd.context, 'No messages were matched!');
    } catch (error) {
      this.logger.error('Failed to fetch messages.');
    }
  }

  private async processMessage(message: Message, command: Command, parts: RegExpMatchArray): Promise<boolean> {
    if (message.context.channel.thread === command.context.channel.thread) {
      return false;
    }

    const [_, pattern, replacement, flags] = parts;
    const expr = new RegExp(pattern, flags);
    if (expr.test(message.body)) {
      const body = message.body.replace(expr, replacement);
      await this.reply(command.context, body);
      return true;
    }

    return false;
  }
}
