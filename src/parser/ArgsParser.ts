import * as yargs from 'yargs-parser';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';

import { BaseParser } from './BaseParser';
import { Parser, ParserData, ParserOptions } from './Parser';
import { TYPE_TEXT } from 'src/utils/Mime';
import { dictValuesToArrays } from 'src/utils';

export interface ArgsParserData extends ParserData {
  args: {
    array: Array<string>;
    boolean: Array<string>;
    configuration: Partial<yargs.Configuration>;
    count: Array<string>;
    default: Array<string>;
    number: Array<string>;
    required: Array<string>;
    string: Array<string>;
    '--': boolean;
  };
}

export type ArgsParserOptions = ParserOptions<ArgsParserData>;

export class ArgsParser extends BaseParser<ArgsParserData> implements Parser {
  constructor(options: ArgsParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const data = await this.decode(msg);

    const missing = [];
    for (const req of this.data.args.required) {
      if (!Reflect.has(data, req)) {
        missing.push(req);
      }
    }

    if (missing.length) {
      // @TODO: return a completion
      await this.bot.send(Message.reply(msg.context, TYPE_TEXT, `missing required arguments: ${missing.join(', ')}`));
      return [];
    }

    return [Command.create({
      context: msg.context,
      data,
      labels: this.data.emit.labels,
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async decode(msg: Message): Promise<any> {
    return dictValuesToArrays(yargs(this.removeTags(msg.body), this.data.args));
  }

  public async complete(): Promise<Array<Command>> {
    throw new NotImplementedError('args parser does not implement completion');
  }
}
