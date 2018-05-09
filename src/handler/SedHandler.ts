import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Listener } from 'src/listener/Listener';

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

      const msg = Message.create({
        body: 'Incorrect input. Please use \`!!s/e/d/[flags]\`',
        context: cmd.context,
        reactions: []
      });

      return this.bot.send(msg);
    }

    this.logger.debug({ parts }, 'fetching messages');
    let messages: Array<Message> = [];
    try {
      messages = await this.bot.fetch({
        channel: cmd.context.roomId,
        listenerId: cmd.context.listenerId,
        useFilters: true
      });
    } catch (error) {
      return this.logger.error('Failed to fetch messages.');
    }

    for (const message of messages) {
      if (await this.processMessage(message, cmd, parts)) {
        return;
      }
    }

    // No matches
    const msg = Message.create({
      body: 'No messages were matched!',
      context: cmd.context,
      reactions: []
    });

    await this.bot.send(msg);
  }

  private async processMessage(message: Message, command: Command, parts: RegExpMatchArray): Promise<boolean> {
    if (message.context.threadId === command.context.threadId) {
      return false;
    }

    if (!!message.body.match(parts[1])) {
      const result = message.body.replace(new RegExp(parts[1], parts[3]), parts[2]);
      const msg = Message.create({
        body: result,
        context: command.context,
        reactions: []
      });

      await this.bot.send(msg);
      return true;
    }
    return false;
  }
}
