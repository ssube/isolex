import { safeLoad } from 'js-yaml';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser } from 'src/parser/Parser';
import { ServiceConfig, ServiceOptions } from 'src/Service';

export interface YamlParserConfig extends ServiceConfig {
  tags: Array<string>;
}

export type YamlParserOptions = ServiceOptions<YamlParserConfig>;

export class YamlParser extends BaseParser<YamlParserConfig> implements Parser {
  constructor(options: YamlParserOptions) {
    super(options);
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
