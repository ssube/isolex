import { Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface EchoHandlerConfig {
  name: string;
  template: string;
}

export interface EchoHandlerOptions extends HandlerOptions<EchoHandlerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class EchoHandler extends BaseHandler<EchoHandlerConfig> implements Handler {
  protected name: string;
  protected template: Template;

  constructor(options: EchoHandlerOptions) {
    super(options);

    this.name = options.config.name;
    this.template = options.compiler.compile(options.config.template);
  }

  public async check(cmd: Command): Promise<boolean> {
    return cmd.name === this.name;
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');
    const msg = Message.create({
      body: this.template.render({ cmd }),
      context: cmd.context,
      reactions: []
    });
    await this.bot.send(msg);
  }
}
