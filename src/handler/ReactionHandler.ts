import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface ReactionChance {
  chance: number;
  name: string;
}

export interface ReactionHandlerConfig extends HandlerConfig {
  field: string;
  reactions: Map<string, Array<ReactionChance>>;
}

export type ReactionHandlerOptions = HandlerOptions<ReactionHandlerConfig>;

export class ReactionHandler extends BaseHandler<ReactionHandlerConfig> implements Handler {
  protected tags: Array<string>;
  protected reactions: Map<string, Array<ReactionChance>>;

  constructor(options: ReactionHandlerOptions) {
    super(options);

    this.reactions = new Map(Object.entries(options.config.reactions));
    this.tags = Array.from(this.reactions.keys());
  }

  public async check(cmd: Command): Promise<boolean> {
    const body = cmd.get(this.config.field);
    if (!body) {
      return false;
    }

    for (const key of this.tags) {
      if (body.includes(key)) {
        return true;
      }
    }

    return false;
  }

  public async handle(cmd: Command): Promise<void> {
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
    const msg = Message.create({
      body: '',
      context: cmd.context,
      reactions
    });
    await this.bot.send(msg);
  }
}
