import { isString } from 'util';

import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig, ParserValue } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export interface RegexParserConfig extends ParserConfig {
  regexp: string;
}

export type RegexParserOptions = ServiceOptions<RegexParserConfig>;

export class RegexParser extends BaseParser<RegexParserConfig> implements Parser {
  protected regexp: RegExp;

  constructor(options: RegexParserOptions) {
    super(options);

    this.regexp = new RegExp(options.data.regexp);
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const data = await this.parseBody(msg, body);

    return [Command.create({
      context: msg.context,
      data: { data },
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async parseBody(msg: Message, value: ParserValue): Promise<any> {
    if (!isString(value)) {
      throw new InvalidArgumentError('value must be a string');
    }

    const parts = value.match(this.regexp);

    this.logger.debug({ parts }, 'splitting on regexp');
    if (!parts) {
      throw new Error('unable to split message on regexp');
    }

    return Array.from(parts);
  }
}
