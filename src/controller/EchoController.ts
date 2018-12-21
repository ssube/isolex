import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Transform } from 'src/transform/Transform';
import { TYPE_TEXT } from 'src/utils/Mime';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export const NOUN_ECHO = 'echo';

export type EchoControllerData = ControllerData;
export interface EchoControllerOptions extends ControllerOptions<EchoControllerData> {
  compiler: TemplateCompiler;
}

export class EchoController extends BaseController<EchoControllerData> implements Controller {
  protected readonly transforms: Array<Transform>;

  constructor(options: EchoControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-echo', [NOUN_ECHO]);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');

    const data = Message.reply(cmd.context, TYPE_TEXT, cmd.toString());
    const messages = await this.transform(cmd, data);
    await this.bot.sendMessage(...messages);
  }
}
