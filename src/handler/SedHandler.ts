import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';

export type SedHandlerConfig = HandlerConfig;
export type SedHandlerOptions = HandlerOptions<SedHandlerConfig>;

export class SedHandler extends BaseHandler<SedHandlerConfig> implements Handler {
  constructor(options: SedHandlerOptions) {
    super(options);
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

      return this.bot.send(Message.reply('Incorrect input. Please use \`!!s/e/d/[flags]\`', cmd.context));
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
    return this.bot.send(Message.reply('No messages were matched!', cmd.context));
  }

  private async processMessage(message: Message, command: Command, parts: RegExpMatchArray): Promise<boolean> {
    if (message.context.threadId === command.context.threadId) {
      return false;
    }

    const [_, pattern, replacement, flags] = parts;

    if (!!message.body.match(pattern)) {
      const body = message.body.replace(new RegExp(pattern, flags), replacement);

      await this.bot.send(Message.reply(body, command.context));
      return true;
    }

    return false;
  }
}
