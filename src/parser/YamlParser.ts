import * as bunyan from 'bunyan';
import { safeLoad } from 'js-yaml';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser } from 'src/parser/Parser';
import { isEventMessage } from 'src/utils';
import { Event } from 'vendor/so-client/src/events';

export interface YamlParserConfig {
  tags: Array<string>;
}

export interface YamlParserOptions {
  bot: Bot;
  config: YamlParserConfig;
  logger: bunyan;
}

export class YamlParser extends BaseParser implements Parser {
  protected logger: bunyan;
  protected tags: Array<string>;

  constructor(options: YamlParserOptions) {
    super();

    this.logger = options.logger.child({
      class: YamlParser.name
    });

    this.tags = options.config.tags;
  }

  public async parse(event: Event): Promise<Array<Command>> {
    if (!isEventMessage(event)) {
      throw new Error('invalid event type');
    }

    const body = this.removeTags(event.content);
    const data = safeLoad(body);
    if (!data) {
      throw new Error('invalid parse value');
    }

    return [new Command(data as any)]; // @todo: make this better
  }
}
