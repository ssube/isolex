import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';

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

  public async handle(cmd: Command): Promise<void> {
    const reactions = [];
    const body = cmd.get(this.config.field);
    for (const [key, next] of this.reactions) {
      this.logger.debug({ body, key }, 'checking reaction');
      if (body.includes(key)) {
        for (const reaction of next) {
          const result = Math.random();
          this.logger.debug({ body, key, next, result, reaction }, 'rolling reaction');
          if (result < reaction.chance) {
            reactions.push(reaction.name);
          }
        }
      }
    }

    this.logger.debug({ cmd, reactions }, 'reacting to command');
    await this.bot.send(Message.create({
      body: '',
      context: cmd.context,
      reactions,
    }));
  }
}
