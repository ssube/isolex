import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface ReactionChance {
  chance: number;
  name: string;
}

export interface ReactionControllerData extends ControllerData {
  field: string;
  reactions: Map<string, Array<ReactionChance>>;
}

export type ReactionControllerOptions = ControllerOptions<ReactionControllerData>;

export class ReactionController extends BaseController<ReactionControllerData> implements Controller {
  protected tags: Array<string>;
  protected reactions: Map<string, Array<ReactionChance>>;

  constructor(options: ReactionControllerOptions) {
    super(options);

    this.reactions = new Map(Object.entries(options.data.reactions));
    this.tags = Array.from(this.reactions.keys());
  }

  public async handle(cmd: Command): Promise<void> {
    const reactions = [];
    const body = cmd.get(this.data.field);
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
      type: TYPE_TEXT,
    }));
  }
}
