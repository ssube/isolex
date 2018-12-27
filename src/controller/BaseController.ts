import { Inject } from 'noicejs';

import { BotService } from 'src/BotService';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { ServiceModule } from 'src/module/ServiceModule';
import { ServiceDefinition } from 'src/Service';
import { Transform, TransformData } from 'src/transform/Transform';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';

export type BaseControllerOptions<TData extends ControllerData> = ControllerOptions<TData>;

@Inject('services')
export abstract class BaseController<TData extends ControllerData> extends BotService<TData> implements Controller {
  public readonly name: string;

  protected readonly nouns: Set<string>;

  // services
  protected readonly services: ServiceModule;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseControllerOptions<TData>, schemaPath: string, nouns: Array<string> = []) {
    super(options, schemaPath);

    this.nouns = new Set(nouns);
    this.services = options.services;
    this.transforms = [];
  }

  public async start() {
    await super.start();

    const transforms: Array<ServiceDefinition<TransformData>> = this.data.transforms || [];
    for (const def of transforms) {
      const transform = await this.services.createService<Transform, any>(def);
      this.transforms.push(transform);
    }
  }

  public async check(cmd: Command): Promise<boolean> {
    this.logger.debug({ controllerId: this.id, noun: cmd.noun, verb: cmd.verb }, 'checking command');

    if (!this.nouns.has(cmd.noun)) {
      this.logger.debug({ noun: cmd.noun }, 'command noun not present');
      return false;
    }

    if (!await this.checkFilters(cmd, this.filters)) {
      this.logger.debug('command failed filters');
      return false;
    }

    this.logger.debug({ cmd }, 'controller can handle command');
    return true;
  }

  public abstract handle(cmd: Command): Promise<void>;

  protected async transform(cmd: Command, type: string, body: any): Promise<any> {
    let result = body;
    for (const transform of this.transforms) {
      const check = await transform.check(cmd);
      if (check) {
        result = await transform.transform(cmd, type, result);
      } else {
        this.logger.debug({ check, transform: transform.name }, 'skipping transform');
      }
    }
    return result;
  }

  protected async transformJSON(cmd: Command, data: any): Promise<void> {
    this.logger.debug({ data }, 'transforming json body');

    const body = await this.transform(cmd, TYPE_JSON, data);
    return this.reply(cmd.context, body);
  }

  protected async reply(ctx: Context, body: string): Promise<void> {
    await this.bot.sendMessage(Message.reply(ctx, TYPE_TEXT, body));
  }
}
