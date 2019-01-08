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
import { dictToMap } from 'src/utils/Map';
import { TYPE_JSON, TYPE_YAML } from 'src/utils/Mime';

export type YamlParserData = ParserData;
export const YAML_TYPES = new Set([TYPE_JSON, TYPE_YAML]);

export class YamlParser extends BaseParser<YamlParserData> implements Parser {
  constructor(options: BotServiceOptions<YamlParserData>) {
    super(options, 'isolex#/definitions/service-parser-yaml');
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const ctx = mustExist(msg.context);
    const data = await this.decode(msg);
    return [await this.createCommand(ctx, dictToMap(data))];
  }

  public async decode(msg: Message): Promise<any> {
    if (!YAML_TYPES.has(msg.type)) {
      throw new MimeTypeError(`body type (${msg.type}) must be one of ${YAML_TYPES}`);
    }

    const parsed = safeLoad(msg.body);
    if (!isObject(parsed)) {
      throw new BaseError('parsed value must be an object');
    }

    // TODO: type check this?
    return parsed;
  }
}
