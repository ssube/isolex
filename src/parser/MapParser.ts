import * as split from 'split-string';
import { isString } from 'util';

import { Command, CommandArgsMap, CommandVerb } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserValue } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { filterNil, setOrPush } from 'src/utils';

/**
 * Mapped commands are the stored form of a command to be produced by a mapping.
 */
export interface MappedCommand {
  /**
   * The name of the emitted command.
   */
  noun: string;
  verb: CommandVerb;
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

export interface MatchAlias {
  match: MatchPattern;
  cmd: string;
}

/**
 * @TODO: support regular expressions
 */
export interface MatchCommand {
  match: MatchPattern;
  emit: MappedCommand;
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
  cmd: MappedCommand;
}

export interface MapParserData extends ParserData {
  aliases: Array<MatchCommand>;
  matches: Array<MatchCommand>;
  split: SplitString.SplitOptions;
}

export type MapParserOptions = ServiceOptions<MapParserData>;

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

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const mapped = await this.decode(msg);
    const commands = [];
    for (const { args, cmd } of mapped) {
      commands.push(Command.create({
        context: msg.context,
        data: this.mapFields(args, cmd.args.fields, cmd.args.rest),
        noun: cmd.noun,
        verb: cmd.verb,
      }));
    }

    return commands;
  }

  public mapArgs(cmd: MappedCommand, pending: Array<string>, original: string, resolved: string) {
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
    if (!isString(msg.body)) {
      throw new InvalidArgumentError('value must be a string');
    }

    const parts = split(msg.body, this.data.split).reverse();
    this.logger.debug({ parts }, 'mapping resolved command');

    const pending = [];
    const mapped = [];
    for (const part of parts) {
      const key = this.resolveAlias(part);
      const cmd = this.matches.find((it) => it.match.str === key);

      if (cmd) {
        const args = this.mapArgs(cmd.emit, pending, part, key);
        mapped.push({ args, cmd: cmd.emit });
        pending.length = 0;
      } else {
        pending.unshift(part);
      }
    }

    return mapped;
  }

  public mapFields(args: Array<string>, fields: Array<string>, rest: string): CommandArgsMap {
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
