import { isNil } from 'lodash';
import { BaseError } from 'noicejs';

import { Parser, ParserData, ParserOutput } from '.';
import { BotServiceOptions } from '../BotService';
import { Command } from '../entity/Command';
import { Message } from '../entity/Message';
import { MimeTypeError } from '../error/MimeTypeError';
import { mustExist } from '../utils';
import { ArrayMapper, ArrayMapperOptions } from '../utils/ArrayMapper';
import { TYPE_TEXT } from '../utils/Mime';
import { BaseParser } from './BaseParser';

export interface RegexParserData extends ParserData {
  dataMapper: ArrayMapperOptions;
  regexp: string;
}

export class RegexParser extends BaseParser<RegexParserData> implements Parser {
  protected mapper: ArrayMapper;
  protected regexp: RegExp;

  constructor(options: BotServiceOptions<RegexParserData>) {
    super(options, 'isolex#/definitions/service-parser-regex');

    this.mapper = new ArrayMapper(options.data.dataMapper);
    this.regexp = new RegExp(options.data.regexp);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.split(msg);

    const replyContext = await this.createContext(ctx);
    return [new Command({
      context: replyContext,
      data: this.mapper.map(data),
      labels: this.data.defaultCommand.labels,
      noun: this.data.defaultCommand.noun,
      verb: this.data.defaultCommand.verb,
    })];
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    const body = await this.split(msg);

    return {
      data: {
        body,
      },
    };
  }

  protected async split(msg: Message): Promise<Array<string>> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const parts = msg.body.match(this.regexp);

    this.logger.debug({ parts }, 'splitting on regexp');
    if (isNil(parts)) {
      throw new BaseError('unable to split message on regexp');
    }

    return Array.from(parts);
  }
}
