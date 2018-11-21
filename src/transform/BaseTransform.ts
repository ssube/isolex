import { safeLoad } from 'js-yaml';

import { BaseService } from 'src/BaseService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Parser } from 'src/parser/Parser';
import { TYPE_JSON, TYPE_TEXT, TYPE_YAML } from 'src/utils/Mime';

import { Transform, TransformData, TransformOptions } from './Transform';

export abstract class BaseTransform<TData extends TransformData> extends BaseService<TData> implements Transform {
  protected readonly parsers: Array<Parser>;

  constructor(options: TransformOptions<TData>) {
    super(options);

    this.parsers = [];
  }

  public async start() {
    const parsers = this.data.parsers || [];
    for (const def of parsers) {
      const parser = await this.bot.createService<Parser, any>(def);
      this.parsers.push(parser);
    }
  }

  public async stop() {
    /* noop */
  }

  public abstract transform(cmd: Command, msg: Message): Promise<Array<Message>>;

  /**
   * @TODO: parse the message before merging
   */
  protected mergeScope(cmd: Command, msg: Message): any {
    return { cmd: cmd.toJSON(), data: this.parseMessage(msg) };
  }

  protected parseMessage(msg: Message): any {
    this.logger.debug({ msg }, 'parsing message');
    switch (msg.type) {
      case TYPE_TEXT:
        return msg.body;
      case TYPE_JSON:
      case TYPE_YAML:
        return safeLoad(msg.body); // TODO: replace this with a real parser
    }
  }
}
