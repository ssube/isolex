import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_TEXT } from 'src/utils/Mime';

export type SedControllerData = ControllerData;
export type SedControllerOptions = ControllerOptions<SedControllerData>;

export class SedController extends BaseController<SedControllerData> implements Controller {
  constructor(options: SedControllerOptions) {
    super({
      ...options,
      nouns: [],
    });
  }

  public async handle(cmd: Command): Promise<void> {
    const args = cmd.data.get('args');
    if (!args) {
      throw new Error('no arguments were provided!');
    }

    // split into regex, replace and flags
    const parts = args[0].match(/\/((?:[^\\]|\\.)*)\/((?:[^\\]|\\.)*)\/([gmiuy]*)/);
    if (!parts) {
      this.logger.debug({ args }, 'incorrect input.');

      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'Incorrect input. Please use \`!!s/e/d/[flags]\`'));
    }

    this.logger.debug({ parts }, 'fetching messages');
    let messages: Array<Message> = [];
    try {
      messages = await this.bot.fetch({
        channel: cmd.context.roomId,
        listenerId: cmd.context.listenerId,
        useFilters: true,
      });
    } catch (error) {
      this.logger.error('Failed to fetch messages.');
    }

    for (const message of messages) {
      if (await this.processMessage(message, cmd, parts)) {
        return;
      }
    }

    // No matches
    return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'No messages were matched!'));
  }

  private async processMessage(message: Message, command: Command, parts: RegExpMatchArray): Promise<boolean> {
    if (message.context.threadId === command.context.threadId) {
      return false;
    }

    const [_, pattern, replacement, flags] = parts;

    if (!!message.body.match(pattern)) {
      const body = message.body.replace(new RegExp(pattern, flags), replacement);

      await this.bot.send(Message.reply(command.context, TYPE_TEXT, body));
      return true;
    }

    return false;
  }
}
