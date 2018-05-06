// noop parser that passes the incoming message as a field

import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Command, CommandType } from 'src/Command';
import { Message } from 'src/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export interface EchoParserConfig extends ParserConfig {
  field: string;
  name: string;
}

export type EchoParserOptions = ServiceOptions<EchoParserConfig>;

export class EchoParser extends BaseParser<EchoParserConfig> implements Parser {
  constructor(options: EchoParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    return [Command.create({
      context: msg.context,
      data: {
        [this.config.field]: [this.removeTags(msg.body)]
      },
      name: this.config.name,
      type: CommandType.None
    })];
  }
}
