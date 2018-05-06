import { flatten } from 'lodash';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command, CommandType } from 'src/Command';
import { Message } from 'src/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import * as split from 'split-string';

export interface SplitParserConfig extends ParserConfig, SplitString.SplitOptions {
  name: string;
  regexp: string;
}

export type SplitParserOptions = ServiceOptions<SplitParserConfig>;

export class SplitParser extends BaseParser<SplitParserConfig> implements Parser {
  protected delims?: Array<string>;
  protected name: string;
  protected regexp?: RegExp;

  constructor(options: SplitParserOptions) {
    super(options);

    this.name = options.config.name;

    if (options.config.regexp) {
      this.regexp = new RegExp(options.config.regexp);
    }
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const args = this.split(body);

    return [Command.create({
      context: msg.context,
      data: { args },
      name: this.name,
      type: CommandType.None
    })];
  }

  public split(msg: string): Array<string> {
    if (this.regexp) {
      const args = msg.match(this.regexp);
      this.logger.debug({ args }, 'splitting on regexp');
      if (args) {
        return Array.from(args);
      } else {
        throw new Error('unable to split message on regexp');
      }
    } else {
      this.logger.debug({ config: this.config, split: msg }, 'splitting string');
      const args = split(msg, this.config);
      this.logger.debug({ args }, 'splitting on delimiters');
      return args;
    }
  }
}
