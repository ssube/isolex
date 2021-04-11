import { isNil, makeMap, mustExist } from '@apextoaster/js-utils';
import { load } from 'js-yaml';
import { isString } from 'lodash';
import { BaseError } from 'noicejs';

import { Parser, ParserData, ParserOutput } from '.';
import { BotServiceOptions } from '../BotService';
import { Command } from '../entity/Command';
import { Message } from '../entity/Message';
import { MimeTypeError } from '../error/MimeTypeError';
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
    const map = makeMap(data.data);
    return [await this.createCommand(ctx, map)];
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    if (YAML_TYPES.has(msg.type) === false) {
      throw new MimeTypeError(`body type (${msg.type}) must be one of ${YAML_TYPES.values()}`);
    }

    const parsed = load(msg.body);
    if (isNil(parsed) || isString(parsed)) {
      throw new BaseError('parsed value must be an object');
    }

    return {
      data: parsed as TemplateScope,
    };
  }
}
