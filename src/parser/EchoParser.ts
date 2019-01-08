import { isString } from 'lodash';

import { BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { Parser, ParserData } from 'src/parser';
import { BaseParser } from 'src/parser/BaseParser';
import { mustExist } from 'src/utils';
import { ArrayMapper, ArrayMapperOptions } from 'src/utils/ArrayMapper';

export interface EchoParserData extends ParserData {
  dataMapper: ArrayMapperOptions;
}

export type EchoParserOptions = BotServiceOptions<EchoParserData>;

/**
 * Forwards the message body as a field. Does not split or otherwise parse, optionally removes the matched tag.
 */
export class EchoParser extends BaseParser<EchoParserData> implements Parser {
  protected mapper: ArrayMapper;

  constructor(options: EchoParserOptions) {
    super(options, 'isolex#/definitions/service-parser-echo');

    this.mapper = new ArrayMapper(this.data.dataMapper);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);
    const cmd = await this.createCommand(ctx, this.mapper.map([data]));
    return [cmd];
  }

  public async decode(msg: Message): Promise<string> {
    if (!isString(msg.body)) {
      throw new InvalidArgumentError('message body must be a string');
    }

    return msg.body;
  }
}
