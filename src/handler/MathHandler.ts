import * as mathjs from 'mathjs';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { formatResult, ResultFormatOptions } from 'src/utils/Math';

export interface MathHandlerConfig extends HandlerConfig {
  format: ResultFormatOptions;
  math: {
    matrix: string;
    number: string;
  };
}

export type MathHandlerOptions = HandlerOptions<MathHandlerConfig>;

export class MathHandler extends BaseHandler<MathHandlerConfig> implements Handler {
  protected math: mathjs.MathJsStatic;

  constructor(options: MathHandlerOptions) {
    super(options);

    this.math = (mathjs as any).create(options.config.math);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'calculating command');

    const args = cmd.get('args');
    if (!args || !args.length) {
      throw new Error('invalid arguments to math handler');
    }

    const expr = args.join(';\n');
    this.logger.debug({ expr }, 'evaluating expression');

    const body = '`' + this.eval(expr, { cmd }) + '`';
    this.logger.debug({ body, expr }, 'compiled expression');

    return this.bot.send(Message.reply(body, cmd.context));
  }

  protected eval(expr: string, scope: any): string {
    try {
      const body = this.math.eval(expr, scope);
      this.logger.debug({ body, expr }, 'evaluated expression');

      return formatResult(body, scope, this.config.format);
    } catch (err) {
      return `error evaluating math: ${err.message}\n${err.stack}`;
    }
  }
}
