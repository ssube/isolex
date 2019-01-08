import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { BotService, BotServiceOptions, INJECT_STORAGE } from 'src/BotService';
import { Command, CommandDataValue, CommandOptions, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Parser, ParserData } from 'src/parser';
import { mustExist } from 'src/utils';
import { getHeadOrDefault } from 'src/utils/Map';
import { Match } from 'src/utils/match';
import { TemplateScope } from 'src/utils/Template';

@Inject(INJECT_STORAGE)
export abstract class BaseParser<TData extends ParserData> extends BotService<TData> implements Parser {
  protected readonly contextRepository: Repository<Context>;
  protected matcher: Match;

  constructor(options: BotServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.contextRepository = mustExist(options[INJECT_STORAGE]).getRepository(Context);
    this.matcher = new Match(options.data.match);
  }

  public async match(msg: Message): Promise<boolean> {
    const results = this.matcher.match(msg);
    return results.matched;
  }

  public abstract parse(msg: Message): Promise<Array<Command>>;

  public abstract decode(msg: Message): Promise<TemplateScope>;

  /**
   * Very simple, stateless completion. Merges data and sends a single command without attempting to parse or decode
   * the value. This does not support multiple arguments.
   */
  public async complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>> {
    const data = new Map(fragment.data).set(fragment.key, value);
    return [await this.createCommand(context, data)];
  }

  protected async createCommand(baseContext: Context, data: Map<string, Array<string>>): Promise<Command> {
    const context = await this.createContext(baseContext);
    const { noun, verb } = this.switchNounVerb(data, this.data.defaultCommand);
    this.logger.debug({ context, noun, verb }, 'create command');

    return new Command({
      context,
      data,
      labels: this.data.defaultCommand.labels,
      noun,
      verb,
    });
  }

  protected createContext(baseContext: Context): Promise<Context> {
    return this.contextRepository.save(new Context({
      ...baseContext,
      parser: this,
    }));
  }

  protected switchNounVerb(data: Map<string, Array<string>>, cmd: CommandOptions = this.data.defaultCommand): {
    noun: string;
    verb: CommandVerb;
  } {
    if (this.data.preferData === true) {
      return {
        noun: getHeadOrDefault(data, 'noun', cmd.noun),
        verb: getHeadOrDefault(data, 'verb', cmd.verb) as CommandVerb,
      };
    } else {
      return cmd;
    }
  }
}
