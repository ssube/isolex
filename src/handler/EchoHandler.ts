import { Inject } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

export interface EchoHandlerConfig {
  pattern: string;
}

export interface EchoHandlerOptions extends BaseOptions {
  bot: Bot;
  compiler: TemplateCompiler;
  config: EchoHandlerConfig;
  logger: Logger;
}

@Inject(TemplateCompiler)
export class EchoHandler implements Handler {
  protected bot: Bot;
  protected logger: Logger;
  protected template: Template;

  constructor(options: EchoHandlerOptions) {
    this.bot = options.bot;
    this.logger = options.logger.child({
      class: EchoHandler.name
    });
    this.template = options.compiler.compile(options.config.pattern);
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
