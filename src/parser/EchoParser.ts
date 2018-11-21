import { isString } from 'lodash';

import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export interface EchoParserData extends ParserData {
  args: {
    field: string;
    remove: boolean;
  };
}

export type EchoParserOptions = ServiceOptions<EchoParserData>;

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
    return [Command.create({
      context: msg.context,
      data: {
        [this.data.args.field]: [parsed],
      },
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

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    const { command } = frag;

    return [command.extend({
      data: {
        [frag.key]: [value],
      },
    })];
  }
}
