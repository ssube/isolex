import { Inject } from 'noicejs';
import * as yargs from 'yargs-parser';

import { NOUN_FRAGMENT } from 'src/controller/CompletionController';
import { Command, CommandDataValue, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { mustExist } from 'src/utils';
import { Dict, dictToMap, dictValuesToArrays, pushMergeMap } from 'src/utils/Map';

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

@Inject('bot')
export class ArgsParser extends BaseParser<ArgsParserData> implements Parser {
  constructor(options: ArgsParserOptions) {
    super(options, 'isolex#/definitions/service-parser-args');
  }

  public async complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>> {
    const args = await this.decodeBody(value.join(' '));
    const data = pushMergeMap(fragment.data, dictToMap(args));

    this.logger.debug({ args, fragment, value }, 'completing command fragment');
    return Promise.all([
      this.createReply(context, data),
    ]);
  }

  public async decode(msg: Message): Promise<Dict<Array<string>>> {
    return this.decodeBody(this.matcher.removeMatches(msg.body));
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);
    return Promise.all([
      this.createReply(ctx, dictToMap(data)),
    ]);
  }

  protected async decodeBody(body: string): Promise<Dict<Array<string>>> {
    return dictValuesToArrays<string>(yargs(body, this.data.args));
  }

  protected createReply(context: Context, data: Map<string, Array<string>>): Promise<Command> {
    const missing = this.validate(data);
    if (missing.length > 0) {
      this.logger.debug({ missing }, 'missing required arguments, creating completion');
      return this.createCompletion(context, data, missing);
    } else {
      return this.createCommand(context, data);
    }
  }

  protected validate(data: Map<string, Array<string>>): Array<string> {
    const missing = [];
    for (const req of this.data.args.required) {
      if (!data.has(req)) {
        missing.push(req);
      }
    }
    return missing;
  }

  protected async createCompletion(context: Context, data: Map<string, Array<string>>, missing: Array<string>): Promise<Command> {
    const fragment = dictToMap({
      key: missing,
      msg: [`missing required arguments: ${missing.join(', ')}`],
      noun: [this.data.defaultCommand.noun],
      parser: [this.id],
      verb: [this.data.defaultCommand.verb],
    });
    const fragmentContext = await this.createContext(context);
    return new Command({
      context: fragmentContext,
      data: new Map([...data, ...fragment]),
      labels: this.data.defaultCommand.labels,
      noun: NOUN_FRAGMENT,
      verb: CommandVerb.Create,
    });
  }
}
