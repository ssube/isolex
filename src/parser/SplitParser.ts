import { isEmpty, trim } from 'lodash';
import * as split from 'split-string';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { ArrayMapper, ArrayMapperOptions } from 'src/utils/ArrayMapper';
import { TYPE_TEXT } from 'src/utils/Mime';

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

export type SplitParserOptions = ParserOptions<SplitParserData>;

export class SplitParser extends BaseParser<SplitParserData> implements Parser {
  protected mapper: ArrayMapper;

  constructor(options: SplitParserOptions) {
    super(options, 'isolex#/definitions/service-parser-split');

    this.mapper = new ArrayMapper(options.data.dataMapper);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const data = await this.decode(msg);
    this.logger.debug({ data }, 'splitting string');
    return [await this.createCommand(msg.context, this.mapper.map(data))];
  }

  public async decode(msg: Message): Promise<Array<string>> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const body = this.matcher.removeMatches(msg.body);
    return this.split(body).map(trim).filter((it) => !isEmpty(it));
  }

  public split(msg: string): Array<string> {
    if (this.data.every) {
      return msg.split('');
    } else {
      return split(msg, this.data.split);
    }
  }
}
