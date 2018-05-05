import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

export interface EchoHandlerConfig {
  name: string;
  template: string;
}

export interface EchoHandlerOptions extends HandlerOptions<EchoHandlerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class EchoHandler implements Handler {
  protected bot: Bot;
  protected logger: Logger;
  protected name: string;
  protected template: Template;

  constructor(options: EchoHandlerOptions) {
    this.bot = options.bot;
    this.logger = options.logger.child({
      class: EchoHandler.name
    });
    this.name = options.config.name;
    this.template = options.compiler.compile(options.config.template);
  }

  public async handle(cmd: Command): Promise<boolean> {
    if (cmd.name !== this.name) {
      return false;
    }

    this.logger.debug({ cmd }, 'echoing command');
    const msg = Message.create({
      body: this.template.render({ cmd }),
      context: cmd.context,
      reactions: []
    });
    await this.bot.send(msg);
    return true;
  }
}
