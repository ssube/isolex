import { safeLoad } from 'js-yaml';
import { isObject } from 'lodash';
import { BaseError } from 'noicejs';

import { BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { Parser, ParserData } from 'src/parser';
import { BaseParser } from 'src/parser/BaseParser';
import { mustExist } from 'src/utils';
import { Dict, dictToMap } from 'src/utils/Map';
import { TYPE_JSON, TYPE_YAML } from 'src/utils/Mime';
import { TemplateScope } from 'src/utils/Template';

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
      const map = dictToMap(data as Dict<Array<string>>);
      return [await this.createCommand(ctx, dictToMap(map))];
    } else {
      return [];
    }
  }

  public async decode(msg: Message): Promise<TemplateScope> {
    if (!YAML_TYPES.has(msg.type)) {
      throw new MimeTypeError(`body type (${msg.type}) must be one of ${YAML_TYPES.values()}`);
    }

    const parsed = safeLoad(msg.body);
    if (!isObject(parsed)) {
      throw new BaseError('parsed value must be an object');
    }

    return parsed;
  }
}
