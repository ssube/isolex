import { isEmpty, trim } from 'lodash';
import split from 'split-string';

import { Parser, ParserData, ParserOutput } from '.';
import { BotServiceOptions } from '../BotService';
import { Command } from '../entity/Command';
import { Message } from '../entity/Message';
import { MimeTypeError } from '../error/MimeTypeError';
import { mustExist } from '../utils';
import { ArrayMapper, ArrayMapperOptions } from '../utils/ArrayMapper';
import { TYPE_TEXT } from '../utils/Mime';
import { BaseParser } from './BaseParser';

export interface SplitParserData extends ParserData {
  dataMapper: ArrayMapperOptions;
  /**
   * Split every individual character.
   */
  every: boolean;

  /**
   * Split options for delimiters, brackets, etc.
   */
  split: SplitString.SplitOptions;
}

export class SplitParser extends BaseParser<SplitParserData> implements Parser {
  protected mapper: ArrayMapper;

  constructor(options: BotServiceOptions<SplitParserData>) {
    super(options, 'isolex#/definitions/service-parser-split');

    this.mapper = new ArrayMapper(options.data.dataMapper);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const ctx = mustExist(msg.context);
    const data = await this.split(msg.body);
    this.logger.debug({ data }, 'splitting string');
    const mapped = this.mapper.map(data);
    return [await this.createCommand(ctx, mapped)];
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const body = this.matcher.removeMatches(msg.body);
    return {
      data: {
        body: this.split(body),
      },
    };
  }

  public split(msg: string) {
    return this.splitBody(msg).map(trim).filter((it) => !isEmpty(it));
  }

  public splitBody(msg: string): Array<string> {
    if (this.data.every) {
      return msg.split('');
    } else {
      return split(msg, this.data.split);
    }
  }
}
