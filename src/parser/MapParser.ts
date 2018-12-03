import * as split from 'split-string';

import { Command, CommandData, CommandDataType, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { filterNil, getHeadOrDefault, setOrPush } from 'src/utils';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface MatchAlias {
  match: MatchPattern;
  cmd: string;
}

/**
 * @TODO: support regular expressions
 */
export interface MatchCommand {
  args: {
    /**
     * Extra arguments to append to the parsed arguments.
     */
    append: Array<string>;
    /**
     * The fields into which arguments should be put.
     */
    fields: Array<string>;
    /**
     * The field into which any remaining arguments should be put.
     */
    rest: string;
  };
  emit: CommandData;
  match: MatchPattern;
  tags: {
    /**
     * Remove the matched tag (usually the first argument).
     */
    remove: boolean;
    /**
     * Resolve the matched tag, replacing any aliases.
     */
    resolve: boolean;
  };

}

export interface MatchPattern {
  never: boolean;
  str: string;
}

/**
 * The results of mapping a message.
 */
export interface MappedMessage {
  args: Array<string>;
  cmd: MatchCommand;
}

export interface MapParserData extends ParserData {
  aliases: Array<MatchCommand>;
  matches: Array<MatchCommand>;
  split: SplitString.SplitOptions;
}

export type MapParserOptions = ParserOptions<MapParserData>;

export class MapParser extends BaseParser<MapParserData> implements Parser {
  protected aliases: Array<MatchCommand>;
  protected matches: Array<MatchCommand>;

  constructor(options: MapParserOptions) {
    super(options);

    this.aliases = Array.from(options.data.aliases);
    this.matches = Array.from(options.data.matches);
    this.tags = filterNil([
      ...this.matches.map((it) => it.match.str),
      ...this.aliases.map((it) => it.match.str),
    ]);
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const mapped = await this.decode(msg);
    const commands = [];
    for (const { args, cmd } of mapped) {
      const data = this.mapFields(args, cmd.args.fields, cmd.args.rest);
      const noun = getHeadOrDefault(data, 'noun', cmd.emit.noun);
      const verb = getHeadOrDefault(data, 'verb', cmd.emit.verb) as CommandVerb;

      commands.push(Command.create({
        context: msg.context,
        data,
        labels: cmd.emit.labels,
        noun,
        verb,
      }));
    }

    return commands;
  }

  public mapArgs(cmd: MatchCommand, pending: Array<string>, original: string, resolved: string) {
    const result = Array.from(pending).concat(cmd.args.append);

    if (cmd.tags.remove) {
      return result;
    }

    if (cmd.tags.resolve) {
      result.unshift(resolved);
    } else {
      result.unshift(original);
    }

    return result;
  }

  /**
   * Map a string into some commands, splitting on keywords.
   */
  public async decode(msg: Message): Promise<Array<MappedMessage>> {
    if (msg.type !== TYPE_TEXT) {
      throw new MimeTypeError();
    }

    const parts = split(msg.body, this.data.split).reverse();
    this.logger.debug({ parts }, 'mapping resolved command');

    const pending = [];
    const mapped = [];
    for (const part of parts) {
      const key = this.resolveAlias(part);
      const cmd = this.matches.find((it) => it.match.str === key);

      if (cmd) {
        const args = this.mapArgs(cmd, pending, part, key);
        mapped.push({ args, cmd });
        pending.length = 0;
      } else {
        pending.unshift(part);
      }
    }

    return mapped;
  }

  public mapFields(args: Array<string>, fields: Array<string>, rest: string): CommandDataType {
    const data = new Map();

    for (const f of fields) {
      if (args.length) {
        setOrPush(data, f, args.shift());
      } else {
        setOrPush(data, f, []);
      }
    }

    setOrPush(data, rest, args);
    return data;
  }

  public resolveAlias(val: string) {
    let out = val;
    for (const { match, emit } of this.aliases) {
      out = out.replace(match.str, emit.noun);
    }
    return out;
  }
}
