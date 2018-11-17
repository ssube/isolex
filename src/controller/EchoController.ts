import { Inject } from 'noicejs';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface EchoControllerConfig extends ControllerConfig {
  template: string;
}

export interface EchoControllerOptions extends ControllerOptions<EchoControllerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class EchoController extends BaseController<EchoControllerConfig> implements Controller {
  protected template: Template;

  constructor(options: EchoControllerOptions) {
    super(options);

    this.template = options.compiler.compile(options.data.template);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');
    return this.bot.send(Message.reply(this.template.render({ cmd }), cmd.context));
  }
}
