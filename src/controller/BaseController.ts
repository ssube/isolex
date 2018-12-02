import { ChildService } from 'src/ChildService';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceDefinition, getLogInfo } from 'src/Service';
import { Transform, TransformData } from 'src/transform/Transform';
import { Filter, checkFilter } from 'src/filter/Filter';

export interface BaseControllerOptions<TData extends ControllerData> extends ControllerOptions<TData> {
  nouns: Array<string>;
}

export abstract class BaseController<TData extends ControllerData> extends ChildService<TData> implements Controller {
  public readonly name: string;

  protected readonly nouns: Set<string>;

  // services
  protected readonly filters: Array<Filter>;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseControllerOptions<TData>) {
    super(options);

    this.nouns = new Set(options.nouns);

    this.filters = [];
    this.transforms = [];
  }

  public async start() {
    const filters = this.data.filters || [];
    for (const def of filters) {
      const filter = await this.bot.createService<Filter, any>(def);
      this.filters.push(filter);
    }

    const transforms: Array<ServiceDefinition<TransformData>> = this.data.transforms || [];
    for (const def of transforms) {
      const transform = await this.bot.createService<Transform, any>(def);
      this.transforms.push(transform);
    }
  }

  public async stop() {
    /* noop */
  }

  public async check(cmd: Command): Promise<boolean> {
    this.logger.debug({ controllerId: this.id, noun: cmd.noun, verb: cmd.verb }, 'checking command');

    if (!this.nouns.has(cmd.noun)) {
      this.logger.debug({ noun: cmd.noun }, 'command noun not present');
      return false;
    }

    for (const filter of this.filters) {
      const behavior = await filter.filter(cmd);
      if (!checkFilter(behavior, this.bot.strict)) {
        this.logger.debug({ filter: getLogInfo(filter) }, 'command failed filter');
        return false;
      }
    }
    
    this.logger.debug({ cmd }, 'controller can handle command');
    return true;
  }

  public abstract handle(cmd: Command): Promise<void>;

  protected async transform(cmd: Command, input: Message): Promise<Array<Message>> {
    let batch = [input];
    for (const transform of this.transforms) {
      const next = [];
      for (const msg of batch) {
        const result = await transform.transform(cmd, msg);
        next.push(...result);
      }
      batch = next;
    }
    return batch;
  }
}
