import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

export interface EchoHandlerConfig {
  template: string;
}

export interface EchoHandlerOptions extends HandlerOptions {
  compiler: TemplateCompiler;
  config: EchoHandlerConfig;
}

// @Inject(TemplateCompiler)
export class EchoHandler implements Handler {
  protected bot: Bot;
  protected logger: Logger;
  protected template: Template;

  constructor(options: EchoHandlerOptions) {
    this.bot = options.bot;
    this.logger = options.logger.child({
      class: EchoHandler.name
    });
    this.template = options.compiler.compile(options.config.template);
  }

  public async handle(cmd: Command): Promise<boolean> {
    const msg = new Message({
      body: this.template.render({cmd}),
      dest: cmd.from
    });
    this.logger.debug({cmd, msg}, 'echoing command');
    await this.bot.send(msg);
    return true;
  }
}
