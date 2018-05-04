import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

export interface ReactionChance {
  chance: number;
  name: string;
}

export interface ReactionHandlerConfig {
  field: string;
  name: string;
  reactions: Map<string, Array<ReactionChance>>;
}

export interface ReactionHandlerOptions extends HandlerOptions<ReactionHandlerConfig> {
  // noop
}

export class ReactionHandler implements Handler {
  protected bot: Bot;
  protected config: ReactionHandlerConfig;
  protected logger: Logger;
  protected reactions: Map<string, Array<ReactionChance>>;

  constructor(options: ReactionHandlerOptions) {
    this.bot = options.bot;
    this.config = options.config;
    this.logger = options.logger.child({
      class: ReactionHandler.name
    });
    this.reactions = new Map(Object.entries(options.config.reactions));
  }

  public async handle(cmd: Command): Promise<boolean> {
    if (cmd.name !== this.config.name) {
      return false;
    }

    const reactions = [];
    const body = cmd.get(this.config.field);
    for (const [key, next] of this.reactions) {
      if (body.includes(key)) {
        for (const reaction of next) {
          if (Math.random() < reaction.chance) {
            reactions.push(reaction.name);
          }
        }
      }
    }

    this.logger.debug({ cmd, reactions }, 'reacting to command');
    const msg = new Message({
      body: '',
      context: cmd.context,
      reactions
    });
    await this.bot.send(msg);
    return true;
  }
}
