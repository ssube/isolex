import { safeLoad } from 'js-yaml';
import { isNil } from 'lodash';
import { isString } from 'util';

import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig, ParserValue } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { TYPE_TEXT, TYPE_YAML } from 'src/utils/Mime';

export type YamlParserConfig = ParserConfig;
export type YamlParserOptions = ServiceOptions<YamlParserConfig>;
export const YAML_TYPES = [TYPE_TEXT, TYPE_YAML];

export class YamlParser extends BaseParser<YamlParserConfig> implements Parser {
  constructor(options: YamlParserOptions) {
    super(options);
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const data = await this.parseBody(msg, body);
    return [Command.create({
      context: msg.context,
      data,
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async parseBody(msg: Message, value: ParserValue): Promise<any> {
    if (!YAML_TYPES.includes(msg.type)) {
      throw new MimeTypeError(`body type (${msg.type}) must be one of ${YAML_TYPES}`);
    }

    // @TODO: convert buffers to strings
    if (!isString(value)) {
      throw new InvalidArgumentError('value must be a string');
    }

    const parsed = safeLoad(value);
    if (isNil(parsed)) {
      throw new Error('invalid parse value');
    }

    return parsed;
  }
}
