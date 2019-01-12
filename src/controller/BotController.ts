import { endsWith } from 'lodash';

import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';

export const NOUN_NOUN = 'bot-noun';

export type BotControllerData = ControllerData;

export class BotController extends BaseController<BotControllerData> implements Controller {
  constructor(options: BaseControllerOptions<BotControllerData>) {
    super(options, 'isolex#/definitions/service-controller-bot', [NOUN_NOUN]);
  }

  @Handler(NOUN_NOUN, CommandVerb.List)
  @CheckRBAC()
  public async getNouns(cmd: Command, ctx: Context): Promise<void> {
    const nouns = [];
    for (const [key, svc] of this.services.listServices()) {
      if (endsWith(svc.kind, '-controller')) {
        const svcNouns = Reflect.get(svc, 'nouns');
        if (svcNouns instanceof Set) {
          for (const noun of svcNouns) {
            nouns.push({
              key,
              noun,
            });
          }
        }
      }
    }
    return this.transformJSON(cmd, nouns);
  }
}
