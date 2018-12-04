import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceDefinition } from 'src/Service';
import { Transform } from 'src/transform/Transform';
import { TYPE_TEXT } from 'src/utils/Mime';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export const NOUN_ECHO = 'echo';

export interface EchoControllerData extends ControllerData {
  transforms: Array<ServiceDefinition>;
}

export interface EchoControllerOptions extends ControllerOptions<EchoControllerData> {
  compiler: TemplateCompiler;
}

export class EchoController extends BaseController<EchoControllerData> implements Controller {
  protected readonly transforms: Array<Transform>;

  constructor(options: EchoControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_ECHO],
    });
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');

    const data = Message.reply(cmd.context, TYPE_TEXT, cmd.toString());
    const msgs = await this.transform(cmd, data);
    return this.bot.send(...msgs);
  }
}
