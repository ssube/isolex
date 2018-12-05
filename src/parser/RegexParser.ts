import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface RegexParserData extends ParserData {
  regexp: string;
}

export type RegexParserOptions = ParserOptions<RegexParserData>;

export class RegexParser extends BaseParser<RegexParserData> implements Parser {
  protected regexp: RegExp;

  constructor(options: RegexParserOptions) {
    super(options);

    this.regexp = new RegExp(options.data.regexp);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const data = await this.decode(msg);

    return [new Command({
      context: msg.context,
      data: { data }, // @TODO: double data doesn't seem right
      labels: this.data.emit.labels,
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async decode(msg: Message): Promise<any> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const body = this.removeTags(msg.body);
    const parts = body.match(this.regexp);

    this.logger.debug({ parts }, 'splitting on regexp');
    if (!parts) {
      throw new Error('unable to split message on regexp');
    }

    return Array.from(parts);
  }
}
