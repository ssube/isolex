import { Logger } from 'noicejs/logger/Logger';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { BaseService, ServiceOptions } from 'src/Service';

export abstract class BaseParser<TConfig extends ParserConfig> extends BaseService<TConfig> implements Parser {
  protected tags: Array<string>;

  constructor(options: ServiceOptions<TConfig>) {
    super(options);

    this.tags = options.config.tags;
  }

  public async start() {
    /* noop */
  }

  public async stop() {
    /* noop */
  }

  public async match(msg: Message): Promise<boolean> {
    this.logger.debug({msg, tags: this.tags}, 'matching event against tags');

    const hasTags = this.includesTag(msg.body);
    this.logger.debug({msg, hasTags}, 'parser matches event');
    return hasTags;
  }

  public abstract parse(msg: Message): Promise<Array<Command>>;

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
