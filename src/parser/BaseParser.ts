import * as bunyan from 'bunyan';
import { Command } from 'src/Command';
import { Parser } from 'src/parser/Parser';
import { isEventMessage } from 'src/utils';
import { Event } from 'vendor/so-client/src/events';

export abstract class BaseParser implements Parser {
  protected logger: bunyan;
  protected tags: Array<string>;

  public async match(event: Event): Promise<boolean> {
    this.logger.debug({event, tags: this.tags}, 'matching event against tags');

    if (isEventMessage(event)) {
      const hasTags = this.includesTag(event.content);
      this.logger.debug({event, hasTags}, 'parser matches event');
      return hasTags;
    }

    return false;
  }

  public abstract parse(event: Event): Promise<Array<Command>>;

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
