import * as split from 'split-string';
import { Command, CommandPropMap, CommandType } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { normalizeMap, setOrPush } from 'src/utils';

/**
 * Mapped commands are the stored form of a command to be produced by a mapping.
 */
export interface MappedCommand {
  /**
   * The fields into which arguments should be put.
   */
  fields: Array<string>;
  /**
   * The name of the emitted command.
   */
  name: string;
  /**
   * Remove the matched tag (usually the first argument).
   */
  remove: boolean;
  /**
   * Resolve the matched tag, replacing any aliases.
   */
  resolve: boolean;
  /**
   * The field into which any remaining arguments should be put.
   */
  rest: string;
}

/**
 * The results of mapping a message.
 */
export interface MappedMessage {
  args: Array<string>;
  cmd: MappedCommand;
}

export interface MapParserConfig extends ParserConfig {
  alias: Map<string, string>;
  emit: Map<string, MappedCommand>;
  split: SplitString.SplitOptions;
}

export type MapParserOptions = ServiceOptions<MapParserConfig>;

export class MapParser extends BaseParser<MapParserConfig> implements Parser {
  protected alias: Map<string, string>;
  protected emit: Map<string, MappedCommand>;

  constructor(options: MapParserOptions) {
    super(options);

    this.alias = normalizeMap(options.config.alias);
    this.emit = normalizeMap(options.config.emit);

    this.tags = [...this.alias.keys(), ...this.emit.keys()];
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const commands = [];
    for (const { args, cmd } of this.mapCommands(msg.body)) {
      commands.push(Command.create({
        context: msg.context,
        data: this.mapFields(args, cmd.fields, cmd.rest),
        name: cmd.name,
        type: CommandType.None,
      }));
    }

    return commands;
  }

  public mapArgs(cmd: MappedCommand, pending: Array<string>, original: string, resolved: string) {
    const result = Array.from(pending);

    if (cmd.remove) {
      return result;
    }

    if (cmd.resolve) {
      result.unshift(resolved);
    } else {
      result.unshift(original);
    }

    return result;
  }
  /**
   * Map a string into some commands, splitting on keywords.
   */
  public mapCommands(val: string): Array<MappedMessage> {
    const parts = split(val, this.config.split).reverse();
    this.logger.debug({ parts }, 'mapping resolved command');

    const pending = [];
    const mapped = [];
    for (const part of parts) {
      const key = this.resolveAlias(part);
      const cmd = this.emit.get(key);

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

  public mapFields(args: Array<string>, fields: Array<string>, rest: string): CommandPropMap {
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
    for (const [alias, emit] of this.alias) {
      out = out.replace(alias, emit);
    }
    return out;
  }
}
