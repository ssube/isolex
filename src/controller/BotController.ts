import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { VERSION_INFO } from 'src/version';

export const NOUN_NOUN = 'bot-noun';
export const NOUN_SERVICE = 'bot-service';
export const NOUN_VERSION = 'bot-version';

export type BotControllerData = ControllerData;

export class BotController extends BaseController<BotControllerData> implements Controller {
  constructor(options: BaseControllerOptions<BotControllerData>) {
    super(options, 'isolex#/definitions/service-controller-bot', [
      NOUN_NOUN,
      NOUN_SERVICE,
      NOUN_VERSION,
    ]);
  }

  @Handler(NOUN_NOUN, CommandVerb.List)
  @CheckRBAC()
  public async listNouns(cmd: Command, ctx: Context): Promise<void> {
    const nouns = [];
    for (const [key, svc] of this.services.listServices()) {
      if (svc instanceof BaseController) {
        for (const noun of svc.getNouns()) {
          nouns.push({
            key,
            noun,
          });
        }
      }
    }
    return this.transformJSON(cmd, nouns);
  }

  @Handler(NOUN_SERVICE, CommandVerb.List)
  public async listServices(cmd: Command): Promise<void> {
    const services = Array.from(this.services.listServices());
    return this.transformJSON(cmd, services);
  }

  @Handler(NOUN_VERSION, CommandVerb.Get)
  public async getVersion(cmd: Command): Promise<void> {
    return this.transformJSON(cmd, VERSION_INFO);
  }
}
