import { isNil } from 'lodash';
import { BaseError } from 'noicejs';

import { BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { Parser, ParserData } from 'src/parser';
import { BaseParser } from 'src/parser/BaseParser';
import { mustExist } from 'src/utils';
import { ArrayMapper, ArrayMapperOptions } from 'src/utils/ArrayMapper';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface RegexParserData extends ParserData {
  dataMapper: ArrayMapperOptions;
  regexp: string;
}

export type RegexParserOptions = BotServiceOptions<RegexParserData>;

export class RegexParser extends BaseParser<RegexParserData> implements Parser {
  protected mapper: ArrayMapper;
  protected regexp: RegExp;

  constructor(options: RegexParserOptions) {
    super(options, 'isolex#/definitions/service-parser-regex');

    this.mapper = new ArrayMapper(options.data.dataMapper);
    this.regexp = new RegExp(options.data.regexp);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);

    const replyContext = await this.createContext(ctx);
    return [new Command({
      context: replyContext,
      data: this.mapper.map(data),
      labels: this.data.defaultCommand.labels,
      noun: this.data.defaultCommand.noun,
      verb: this.data.defaultCommand.verb,
    })];
  }

  public async decode(msg: Message): Promise<Array<string>> {
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
