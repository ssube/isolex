import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Transform } from 'src/transform/Transform';
import { TYPE_TEXT } from 'src/utils/Mime';
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
    this.logger.debug({ cmd }, 'echoing command');

    const result = await this.transform(cmd, TYPE_TEXT, {});
    return this.reply(cmd.context, result);
  }
}
