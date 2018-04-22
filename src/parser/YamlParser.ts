import * as bunyan from 'bunyan';
import { safeLoad } from 'js-yaml';
import { Bot } from 'src/Bot';
import { Command } from 'src/command/Command';
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

export class YamlParser implements Parser {
  protected logger: bunyan;
  protected tags: Array<string>;

  constructor(options: YamlParserOptions) {
    this.logger = options.logger.child({
      class: YamlParser.name
    });
    this.logger.debug(options, 'creating yaml parser');

    this.tags = options.config.tags;
  }

  public async match(event: Event): Promise<boolean> {
    if (isEventMessage(event)) {
      for (const t of this.tags) {
        if (event.content.includes(t)) {
          return true;
        }
      }
    }

    return false;
  }

  public async parse(event: Event): Promise<Command> {
    if (!isEventMessage(event)) {
      throw new Error('invalid event type');
    }

    let content = event.content;
    for (const t of this.tags) {
      content = content.replace(t, '');
    }

    const data = safeLoad(content);
    if (!data) {
      throw new Error('invalid parse value');
    }

    return new Command(data as any); // @todo: make this better
  }
}
