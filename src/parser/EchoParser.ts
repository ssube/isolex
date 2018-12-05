import { isString } from 'lodash';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';

export interface EchoParserData extends ParserData {
  args: {
    field: string;
    remove: boolean;
  };
}

export type EchoParserOptions = ParserOptions<EchoParserData>;

/**
 * Forwards the message body as a field. Does not split or otherwise parse, optionally removes the matched tag.
 *
 * @TODO: implement optional removal
 */
export class EchoParser extends BaseParser<EchoParserData> implements Parser {
  constructor(options: EchoParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const parsed = await this.decode(msg);
    return [new Command({
      context: msg.context,
      data: {
        [this.data.args.field]: [parsed],
      },
      labels: this.data.emit.labels,
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public async decode(msg: Message): Promise<any> {
    if (!isString(msg.body)) {
      throw new InvalidArgumentError('message body must be a string');
    }
    return this.removeTags(msg.body);
  }
}
