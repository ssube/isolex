import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface EchoHandlerConfig extends HandlerConfig {
  template: string;
}

export interface EchoHandlerOptions extends HandlerOptions<EchoHandlerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class EchoHandler extends BaseHandler<EchoHandlerConfig> implements Handler {
  protected template: Template;

  constructor(options: EchoHandlerOptions) {
    super(options);

    this.template = options.compiler.compile(options.config.template);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');
    return this.bot.send(Message.reply(this.template.render({ cmd }), cmd.context));
  }
}
