import { safeLoad } from 'js-yaml';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Message } from 'src/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser } from 'src/parser/Parser';

export interface YamlParserConfig {
  tags: Array<string>;
}

export interface YamlParserOptions {
  bot: Bot;
  config: YamlParserConfig;
  logger: Logger;
}

export class YamlParser extends BaseParser implements Parser {
  protected logger: Logger;
  protected tags: Array<string>;

  constructor(options: YamlParserOptions) {
    super();

    this.logger = options.logger.child({
      class: YamlParser.name
    });

    this.tags = options.config.tags;
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const data = safeLoad(body);
    if (!data) {
      throw new Error('invalid parse value');
    }

    return [Command.create(data as any)]; // @todo: make this better
  }
}
