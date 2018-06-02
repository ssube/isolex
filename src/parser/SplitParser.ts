import { isEmpty, trim } from 'lodash';
import * as split from 'split-string';
import { Command, CommandType } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export interface SplitParserConfig extends ParserConfig {
  /**
   * Split every individual character.
   */
  every: boolean;

  /**
   * Split options for delimiters, brackets, etc.
   */
  split: SplitString.SplitOptions;
}

export type SplitParserOptions = ServiceOptions<SplitParserConfig>;

export class SplitParser extends BaseParser<SplitParserConfig> implements Parser {
  constructor(options: SplitParserOptions) {
    super(options);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const args = this.split(body).map(trim).filter((it) => !isEmpty(it));
    this.logger.debug({ args, body }, 'splitting string');

    return [Command.create({
      context: msg.context,
      data: { args },
      name: this.name,
      type: CommandType.None,
    })];
  }

  public split(msg: string): Array<string> {
    if (this.config.every) {
      return msg.split('');
    } else {
      return split(msg, this.config.split);
    }
  }
}
