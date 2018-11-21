import { BaseService } from 'src/BaseService';
import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Parser, ParserData } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export abstract class BaseParser<TData extends ParserData> extends BaseService<TData> implements Parser {
  protected tags: Array<string>;

  constructor(options: ServiceOptions<TData>) {
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

  public abstract complete(frag: Fragment, value: string): Promise<Array<Command>>;

  public abstract parse(msg: Message): Promise<Array<Command>>;

  public abstract decode(msg: Message): Promise<any>;

  protected includesTag(body: string): boolean {
    for (const t of this.tags) {
      if (body.includes(t)) {
        return true;
      }
    }

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
