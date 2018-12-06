import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { ServiceMetadata } from 'src/Service';
import { Match, MatchData } from 'src/utils/match';

export interface MatchCommand {
  match: MatchData;
  forward: ServiceMetadata;
}

export interface MapParserData extends ParserData {
  matches: Array<MatchCommand>;
}

export interface CompiledMatchCommand {
  match: Match;
  forward: Parser;
}

export type MapParserOptions = ParserOptions<MapParserData>;

export class MapParser extends BaseParser<MapParserData> implements Parser {
  protected matches: Array<CompiledMatchCommand>;

  constructor(options: MapParserOptions) {
    super(options);

    this.matches = options.data.matches.map((cmd) => {
      this.logger.debug({ forward: cmd.forward }, 'getting forward service');
      return {
        forward: this.bot.getService<Parser>(cmd.forward),
        match: new Match(cmd.match)
      }
    });
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const commands = [];
    for (const match of this.matches) {
      if (match.match.match(msg)) { // 
        const next = await match.forward.parse(msg);
        commands.push(...next);
      }
    }
    return commands;
  }

  public decode(msg: Message): Promise<any> {
    throw new NotImplementedError();
  }
}
