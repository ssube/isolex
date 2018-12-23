import { safeLoad } from 'js-yaml';

import { BotService } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceModule } from 'src/module/ServiceModule';
import { Parser } from 'src/parser/Parser';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
import { TYPE_JSON, TYPE_TEXT, TYPE_YAML } from 'src/utils/Mime';

export abstract class BaseTransform<TData extends TransformData> extends BotService<TData> implements Transform {
  protected readonly parsers: Array<Parser>;
  protected readonly services: ServiceModule;

  constructor(options: TransformOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.parsers = [];
    this.services = options.services;
  }

  public async start() {
    const parsers = this.data.parsers || [];
    for (const def of parsers) {
      const parser = await this.services.createService<Parser, any>(def);
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
