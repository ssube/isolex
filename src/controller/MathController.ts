import * as mathjs from 'mathjs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { formatResult, ResultFormatOptions } from 'src/utils/Math';
import { TYPE_TEXT } from 'src/utils/Mime';

export const NOUN_MATH = 'math';

export interface MathControllerData extends ControllerData {
  format: ResultFormatOptions;
  math: {
    matrix: string;
    number: string;
  };
}

export type MathControllerOptions = ControllerOptions<MathControllerData>;

export class MathController extends BaseController<MathControllerData> implements Controller {
  protected math: mathjs.MathJsStatic;

  constructor(options: MathControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-math', [NOUN_MATH]);

    this.math = (mathjs as any).create(options.data.math);
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'calculating command');

    const args = cmd.get('args');
    if (!args || !args.length) {
      return this.reply(cmd.context, 'invalid arguments to math controller');
    }

    const expr = args.join(';\n');
    this.logger.debug({ expr }, 'evaluating expression');

    const body = '`' + this.eval(expr, { cmd }) + '`';
    this.logger.debug({ body, expr }, 'compiled expression');

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, body));
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
