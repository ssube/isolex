import * as yargs from 'yargs-parser';

import { NOUN_FRAGMENT } from 'src/controller/CompletionController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { dictValuesToArrays } from 'src/utils';

import { BaseParser } from './BaseParser';
import { Parser, ParserData, ParserOptions } from './Parser';

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
      // @TODO: should completion allow many arguments?
      await this.bot.execute(Command.create({
        context: msg.context,
        data: {
          ...data,
          key: missing,
          msg: `missing required arguments: ${missing.join(', ')}`,
          noun: [this.data.emit.noun],
          parser: [this.id],
          verb: [this.data.emit.verb],
        },
        labels: {},
        noun: NOUN_FRAGMENT,
        verb: CommandVerb.Create,
      }));
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
}
