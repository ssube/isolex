import { ChildService, ChildServiceOptions } from 'src/ChildService';
import { Command, CommandDataValue } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Parser, ParserData } from 'src/parser/Parser';
import { Context } from 'src/entity/Context';

export abstract class BaseParser<TData extends ParserData> extends ChildService<TData> implements Parser {
  protected tags: Array<string>;

  constructor(options: ChildServiceOptions<TData>) {
    super(options);

    this.tags = options.data.tags;
  }

  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async match(msg: Message): Promise<boolean> {
    return this.includesTag(msg.body);
  }

  public abstract parse(msg: Message): Promise<Array<Command>>;

  public abstract decode(msg: Message): Promise<any>;

  /**
   * Very simple, stateless completion. Merges data and sends a single command without attempting to parse or decode
   * the value. This does not support multiple arguments.
   */
  public async complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>> {
    const data = new Map(fragment.data).set(fragment.key, value);
    return [Command.create({
      context,
      data,
      labels: fragment.labels,
      noun: fragment.noun,
      verb: fragment.verb,
    })];
  }

  protected includesTag(body: string): boolean {
    for (const t of this.tags) {
      if (body.includes(t)) {
        this.logger.debug({ tag: t }, 'message includes tag');
        return true;
      }
    }

    this.logger.debug('message does not include any tags');
    return false;
  }

  protected removeTags(body: string): string {
    let result = body;
    for (const t of this.tags) {
      result = result.replace(t, '');
    }
    return result;
  }
}
