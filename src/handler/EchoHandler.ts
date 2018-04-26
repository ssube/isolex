import * as bunyan from 'bunyan';
import * as handlebars from 'handlebars';
import { Bot } from 'src/Bot';
import { Command } from 'src/command/Command';
import { Destination } from 'src/Destination';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';

export interface EchoHandlerConfig {
  pattern: string;
}

export interface EchoHandlerOptions {
  bot: Bot;
  config: EchoHandlerConfig;
  logger: bunyan;
}

// @Inject(Bot)
export class EchoHandler implements Handler {
  protected bot: Bot;
  protected logger: bunyan;
  protected template: HandlebarsTemplateDelegate;

  constructor(options: EchoHandlerOptions) {
    this.logger = options.logger.child({
      class: EchoHandler.name
    });

    this.bot = options.bot;
    const compiler = handlebars.create();
    compiler.registerHelper('reply', (dest: Destination) => this.formatDestination(dest));
    this.template = compiler.compile(options.config.pattern);
  }

  public async handle(cmd: Command): Promise<boolean> {
    const msg = new Message({
      body: this.template({cmd}),
      dest: cmd.from
    });
    this.logger.debug({cmd, msg}, 'echoing command');
    await this.bot.send(msg);
    return true;
  }

  public formatDestination(dest: Destination): string {
    return `@${dest.userName}`;
  }
}
