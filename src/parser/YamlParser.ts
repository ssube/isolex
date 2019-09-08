import { safeLoad } from 'js-yaml';
import { isObject } from 'lodash';
import { BaseError } from 'noicejs';

import { Parser, ParserData, ParserOutput } from '.';
import { BotServiceOptions } from '../BotService';
import { Command } from '../entity/Command';
import { Message } from '../entity/Message';
import { MimeTypeError } from '../error/MimeTypeError';
import { mustExist } from '../utils';
import { makeMap } from '../utils/Map';
import { TYPE_JSON, TYPE_YAML } from '../utils/Mime';
import { TemplateScope } from '../utils/Template';
import { BaseParser } from './BaseParser';

export type YamlParserData = ParserData;
export const YAML_TYPES = new Set([TYPE_JSON, TYPE_YAML]);

export class YamlParser extends BaseParser<YamlParserData> implements Parser {
  constructor(options: BotServiceOptions<YamlParserData>) {
    super(options, 'isolex#/definitions/service-parser-yaml');
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);

    if (isObject(data)) {
      // TODO: this cast and conversion should not be necessary
      const map = makeMap(data.data);
      return [await this.createCommand(ctx, map)];
    } else {
      return [];
    }
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    if (!YAML_TYPES.has(msg.type)) {
      throw new MimeTypeError(`body type (${msg.type}) must be one of ${YAML_TYPES.values()}`);
    }

    const parsed = safeLoad(msg.body);
    if (!isObject(parsed)) {
      throw new BaseError('parsed value must be an object');
    }

    return {
      data: parsed as TemplateScope,
    };
  }
}
