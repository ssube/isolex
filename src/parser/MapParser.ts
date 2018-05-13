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
  fields: Array<string>;
  name: string;
  remove: boolean;
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
    for (const {args, cmd} of this.mapCommand(msg.body)) {
      commands.push(Command.create({
        context: msg.context,
        data: this.mapFields(args, cmd.fields, cmd.rest),
        name: cmd.name,
        type: CommandType.None
      }));
    }

    return commands;
  }

  /**
   * Map a string into some commands, after checking for emit keys.
   */
  public mapCommand(val: string): Array<MappedMessage> {
    const parts = split(val, this.config.split).reverse();
    this.logger.debug({ parts }, 'mapping resolved command');

    const pending = [];
    const mapped = [];
    for (const part of parts) {
      const resolved = this.replaceAlias(part);
      const cmd = this.emit.get(resolved);

      if (cmd) {
        const args = Array.from(pending);

        if (!cmd.remove) {
          args.unshift(part);
        }

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

  public replaceAlias(val: string) {
    let out = val;
    for (const [alias, emit] of this.alias) {
      out = out.replace(alias, emit);
    }
    return out;
  }
}
