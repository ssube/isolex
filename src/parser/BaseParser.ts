import { ChildService, ChildServiceOptions } from 'src/ChildService';
import { Command, CommandDataValue, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Parser, ParserData } from 'src/parser/Parser';
import { getHeadOrDefault } from 'src/utils/Map';
import { Match } from 'src/utils/match';

export abstract class BaseParser<TData extends ParserData> extends ChildService<TData> implements Parser {
  protected matcher: Match;

  constructor(options: ChildServiceOptions<TData>) {
    super(options);

    this.matcher = new Match(options.data.match);
  }

  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async match(msg: Message): Promise<boolean> {
    const results = this.matcher.match(msg);
    return results.matched;
  }

  public abstract parse(msg: Message): Promise<Array<Command>>;

  public abstract decode(msg: Message): Promise<any>;

  /**
   * Very simple, stateless completion. Merges data and sends a single command without attempting to parse or decode
   * the value. This does not support multiple arguments.
   */
  public async complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>> {
    const data = new Map(fragment.data).set(fragment.key, value);
    return [Command.emit({
      ...fragment,
      context,
     }, context, data)];
  }

  protected async createCommand(baseContext: Context, data: Map<string, Array<string>>, emit = this.data.emit): Promise<Command> {
    const context = baseContext.extend({
      parser: this,
    });
    const noun = getHeadOrDefault(data, 'noun', emit.noun);
    const verb = getHeadOrDefault(data, 'verb', emit.verb) as CommandVerb;
    this.logger.debug({ context, noun, verb }, 'emit command');

    return new Command({
      context,
      data,
      labels: this.data.emit.labels,
      noun,
      verb,
    });
  }
}
