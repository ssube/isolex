import { Command } from 'src/command/Command';
import { Parser } from 'src/parser/Parser';
import { isEventMessage } from 'src/utils';
import { Event } from 'vendor/so-client/src/events';

export abstract class BaseParser implements Parser {
  protected tags: Array<string>;

  public async match(event: Event): Promise<boolean> {
    if (isEventMessage(event)) {
      return this.includesTag(event.content);
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
