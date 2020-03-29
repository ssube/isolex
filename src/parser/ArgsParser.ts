import { makeMap, mustExist, normalizeMap, pushMergeMap } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import yargs from 'yargs-parser';

import { Parser, ParserData, ParserOutput } from '.';
import { BotServiceOptions } from '../BotService';
import { createCompletion } from '../controller/helpers';
import { Command, CommandDataValue } from '../entity/Command';
import { Context } from '../entity/Context';
import { Fragment } from '../entity/Fragment';
import { Message } from '../entity/Message';
import { MimeTypeError } from '../error/MimeTypeError';
import { TYPE_TEXT } from '../utils/Mime';
import { BaseParser } from './BaseParser';

export interface ArgsParserData extends ParserData {
  args: {
    array?: Array<string>;
    boolean?: Array<string>;
    configuration?: Partial<yargs.Configuration>;
    count?: Array<string>;
    default?: Array<string>;
    number?: Array<string>;
    required: Array<string>;
    string?: Array<string>;
    '--'?: boolean;
  };
}

@Inject()
export class ArgsParser extends BaseParser<ArgsParserData> implements Parser {
  constructor(options: BotServiceOptions<ArgsParserData>) {
    super(options, 'isolex#/definitions/service-parser-args');
  }

  public async complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>> {
    const args = await this.decodeBody(value.join(' '));
    const data = pushMergeMap(fragment.data, makeMap(args.data));

    this.logger.debug({ args, fragment, value }, 'completing command fragment');
    return Promise.all([
      this.createReply(context, data),
    ]);
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const matched = this.matcher.removeMatches(msg.body);
    return this.decodeBody(matched);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);
    return Promise.all([
      this.createReply(ctx, makeMap(data.data)),
    ]);
  }

  protected async decodeBody(body: string): Promise<ParserOutput> {
    return {
      data: normalizeMap(yargs(body, this.data.args)),
    };
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
    const msg = `missing required arguments: ${missing.join(', ')}`;
    const fragmentContext = await this.createContext(context);
    const [key] = missing;
    return createCompletion({
      context: fragmentContext,
      data,
      labels: this.data.defaultCommand.labels,
      noun: this.data.defaultCommand.noun,
      verb: this.data.defaultCommand.verb,
    }, key, msg, this);
  }
}
