import { safeLoad } from 'js-yaml';
import { isNil } from 'lodash';

import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { TYPE_JSON, TYPE_YAML } from 'src/utils/Mime';

export type YamlParserData = ParserData;
export type YamlParserOptions = ParserOptions<YamlParserData>;
export const YAML_TYPES = [TYPE_JSON, TYPE_YAML];

export class YamlParser extends BaseParser<YamlParserData> implements Parser {
  constructor(options: YamlParserOptions) {
    super(options);
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const data = await this.decode(msg);
    return [Command.emit(this.data.emit, msg.context, data)];
  }

  public async decode(msg: Message): Promise<any> {
    if (!YAML_TYPES.includes(msg.type)) {
      throw new MimeTypeError(`body type (${msg.type}) must be one of ${YAML_TYPES}`);
    }

    const parsed = safeLoad(msg.body);
    if (isNil(parsed)) {
      throw new Error('invalid parse value');
    }

    return parsed;
  }
}
