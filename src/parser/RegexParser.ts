import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { Fragment } from 'src/entity/Fragment';
import { NotImplementedError } from 'src/error/NotImplementedError';

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
    const parts = body.match(this.regexp);
    this.logger.debug({ parts }, 'splitting on regexp');
    if (!parts) {
      throw new Error('unable to split message on regexp');
    }

    const args = Array.from(parts);

    return [Command.create({
      context: msg.context,
      data: { args },
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }
}
