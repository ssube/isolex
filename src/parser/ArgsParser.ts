import * as yargs from 'yargs-parser';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';

import { BaseParser } from './BaseParser';
import { Parser, ParserData, ParserOptions } from './Parser';

export interface ArgsParserData extends ParserData {
  args: any;
}

export type ArgsParserOptions = ParserOptions<ArgsParserData>;

export class ArgsParser extends BaseParser<ArgsParserData> implements Parser {
  constructor(options: ArgsParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const data = await this.decode(msg);
    return [Command.create({
      context: msg.context,
      data,
      labels: this.data.emit.labels,
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async decode(msg: Message): Promise<any> {
    return yargs(this.removeTags(msg.body), this.data.args);
  }

  public async complete(): Promise<Array<Command>> {
    throw new NotImplementedError('args parser does not implement completion');
  }
}
