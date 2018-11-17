import { safeLoad } from 'js-yaml';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { Fragment } from 'src/entity/Fragment';
import { NotImplementedError } from 'src/error/NotImplementedError';

export type YamlParserConfig = ParserConfig;
export type YamlParserOptions = ServiceOptions<YamlParserConfig>;

export class YamlParser extends BaseParser<YamlParserConfig> implements Parser {
  constructor(options: YamlParserOptions) {
    super(options);
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const data = safeLoad(body);
    if (!data) {
      throw new Error('invalid parse value');
    }

    return [Command.create({
      context: msg.context,
      data,
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }
}
