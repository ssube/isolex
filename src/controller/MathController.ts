import * as mathjs from 'mathjs';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { formatResult, ResultFormatOptions } from 'src/utils/Math';

export interface MathControllerConfig extends ControllerConfig {
  format: ResultFormatOptions;
  math: {
    matrix: string;
    number: string;
  };
}

export type MathControllerOptions = ControllerOptions<MathControllerConfig>;

export class MathController extends BaseController<MathControllerConfig> implements Controller {
  protected math: mathjs.MathJsStatic;

  constructor(options: MathControllerOptions) {
    super(options);

    this.math = (mathjs as any).create(options.data.math);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'calculating command');

    const args = cmd.get('args');
    if (!args || !args.length) {
      throw new Error('invalid arguments to math controller');
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

      return formatResult(body, scope, this.data.format);
    } catch (err) {
      return `error evaluating math: ${err.message}\n${err.stack}`;
    }
  }
}
