import { Inject } from 'noicejs';

import { Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Match, MatchData } from 'src/utils/match';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface ReactionChance {
  add: Array<string>;
  chance: number;
  match: MatchData;
}

export interface ReactionControllerData extends ControllerData {
  reactions: Array<ReactionChance>;
}

export interface CompiledReaction {
  add: Array<string>;
  chance: number;
  match: Match;
}

export type ReactionControllerOptions = BaseControllerOptions<ReactionControllerData>;

export const NOUN_REACTION = 'reaction';

@Inject()
export class ReactionController extends BaseController<ReactionControllerData> implements Controller {
  protected reactions: Array<CompiledReaction>;

  constructor(options: ReactionControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-reaction', [NOUN_REACTION]);

    this.reactions = options.data.reactions.map((r) => {
      return {
        add: r.add,
        chance: r.chance,
        match: new Match(r.match),
      };
    });
  }

  @Handler(NOUN_REACTION, CommandVerb.Create)
  public async createReaction(cmd: Command, ctx: Context): Promise<void> {
    const reactions = [];
    const bodies = cmd.get('body');
    for (const body of bodies) {
      const matchScope = {
        body,
        cmd,
      };
      const potential = this.reactions.filter((r) => r.match.match(matchScope).matched);
      reactions.push(...this.rollReactions(potential));
    }

    if (reactions.length === 0) {
      return;
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

  protected rollReactions(reactions: Array<CompiledReaction>): Array<string> {
    const results = [];
    this.logger.debug({ reactions }, 'checking reactions');
    for (const reaction of reactions) {
      for (const emoji of reaction.add) {
        const result = Math.random();
        this.logger.debug({ result, reaction }, 'rolling reaction');
        if (result < reaction.chance) {
          results.push(emoji);
        }
      }
    }
    return results;
  }
}
