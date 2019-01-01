import { Inject } from 'noicejs';

import { BaseController, ErrorReplyType } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Transform } from 'src/transform/Transform';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export const NOUN_ECHO = 'echo';

export type EchoControllerData = ControllerData;
export interface EchoControllerOptions extends ControllerOptions<EchoControllerData> {
  compiler: TemplateCompiler;
}

@Inject()
export class EchoController extends BaseController<EchoControllerData> implements Controller {
  protected readonly transforms: Array<Transform>;

  constructor(options: EchoControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-echo', [NOUN_ECHO]);
  }

  public async handle(cmd: Command): Promise<void> {
    if (!this.checkGrants(cmd.context, `${NOUN_ECHO}:${CommandVerb.Create}`)) {
      return this.errorReply(cmd.context, ErrorReplyType.GrantMissing);
    }

    this.logger.debug({ cmd }, 'echoing command');
    return this.transformJSON(cmd, {});
  }
}
