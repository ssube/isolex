import { Command, CommandType } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export interface EchoParserConfig extends ParserConfig {
  field: string;
  name: string;
  remove: boolean;
}

export type EchoParserOptions = ServiceOptions<EchoParserConfig>;

/**
 * Forwards the message body as a field. Does not split or otherwise parse, optionally removes the matched tag.
 *
 * @todo: implement optional removal
 */
export class EchoParser extends BaseParser<EchoParserConfig> implements Parser {
  constructor(options: EchoParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    return [Command.create({
      context: msg.context,
      data: {
        [this.config.field]: [this.removeTags(msg.body)]
      },
      name: this.config.name,
      type: CommandType.None
    })];
  }
}
