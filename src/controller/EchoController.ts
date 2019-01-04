import { Inject } from 'noicejs';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export const NOUN_ECHO = 'echo';

export type EchoControllerData = ControllerData;
export interface EchoControllerOptions extends ControllerOptions<EchoControllerData> {
  compiler: TemplateCompiler;
}

@Inject()
export class EchoController extends BaseController<EchoControllerData> implements Controller {
  constructor(options: EchoControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-echo', [NOUN_ECHO]);
  }

  @HandleNoun(NOUN_ECHO)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
  public async createEcho(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');
    return this.transformJSON(cmd, {});
  }
}
