// noop parser that passes the incoming message as a field

import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Command, CommandType } from 'src/Command';
import { Message } from 'src/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser } from 'src/parser/Parser';

export interface EchoParserConfig {
  field: string;
  name: string;
  tags: Array<string>;
}

export interface EchoParserOptions extends BaseOptions {
  config: EchoParserConfig;
  logger: Logger;
}

export class EchoParser extends BaseParser implements Parser {
  protected config: EchoParserConfig;

  constructor(options: EchoParserOptions) {
    super();

    this.config = options.config;
    this.logger = options.logger.child({
      class: EchoParser.name
    });
    this.tags = options.config.tags;
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    return [new Command({
      context: msg.context,
      data: {
        [this.config.field]: [this.removeTags(msg.body)]
      },
      name: this.config.name,
      type: CommandType.None
    })];
  }
}
