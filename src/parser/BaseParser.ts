import { Logger } from 'noicejs/logger/Logger';
import { Command } from 'src/Command';
import { Message } from 'src/Message';
import { Parser } from 'src/parser/Parser';

export abstract class BaseParser implements Parser {
  protected logger: Logger;
  protected tags: Array<string>;

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
