import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
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

export const NOUN_REACTION = 'reaction';

@Inject()
export class ReactionController extends BaseController<ReactionControllerData> implements Controller {
  protected reactions: Map<string, Array<ReactionChance>>;

  constructor(options: ReactionControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-reaction', [NOUN_REACTION]);

    this.reactions = new Map(Object.entries(options.data.reactions));
  }

  @Handler(NOUN_REACTION, CommandVerb.Create)
  @CheckRBAC()
  public async createReaction(cmd: Command, ctx: Context): Promise<void> {
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
    await this.bot.sendMessage(new Message({
      body: '',
      context: ctx,
      labels: cmd.labels,
      reactions,
      type: TYPE_TEXT,
    }));
  }
}
