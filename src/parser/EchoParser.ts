import { BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { Parser, ParserData, ParserOutput } from 'src/parser';
import { BaseParser } from 'src/parser/BaseParser';
import { mustExist } from 'src/utils';
import { ArrayMapper, ArrayMapperOptions } from 'src/utils/ArrayMapper';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface EchoParserData extends ParserData {
  dataMapper: ArrayMapperOptions;
}

/**
 * Forwards the message body as a field. Does not split or otherwise parse, optionally removes the matched tag.
 */
export class EchoParser extends BaseParser<EchoParserData> implements Parser {
  protected mapper: ArrayMapper;

  constructor(options: BotServiceOptions<EchoParserData>) {
    super(options, 'isolex#/definitions/service-parser-echo');

    this.mapper = new ArrayMapper(this.data.dataMapper);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);
    const cmd = await this.createCommand(ctx, this.mapper.map(data.data.body));
    return [cmd];
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    return {
      data: {
        body: [msg.body],
      },
    };
  }
}
