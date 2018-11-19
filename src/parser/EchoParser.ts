import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig, ParserValue } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { isString } from 'util';

export interface EchoParserConfig extends ParserConfig {
  args: {
    field: string;
    remove: boolean;
  };
}

export type EchoParserOptions = ServiceOptions<EchoParserConfig>;

/**
 * Forwards the message body as a field. Does not split or otherwise parse, optionally removes the matched tag.
 *
 * @TODO: implement optional removal
 */
export class EchoParser extends BaseParser<EchoParserConfig> implements Parser {
  constructor(options: EchoParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const parsed = await this.parseBody(msg, msg.body);
    return [Command.create({
      context: msg.context,
      data: {
        [this.data.args.field]: [parsed],
      },
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async parseBody(msg: Message, data: ParserValue): Promise<any> {
    if (isString(data)) {
      return this.removeTags(data);
    } else {
      return data;
    }
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    const { command } = frag;

    return [command.extend({
      data: {
        [frag.key]: [value],
      },
    })];
  }
}
