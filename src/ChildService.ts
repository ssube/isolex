import { BaseService } from './BaseService';
import { Bot } from './Bot';
import { Service, ServiceOptions } from './Service';

export type ChildServiceOptions<TData> = ServiceOptions<TData> & {
  bot: Bot;
};

export abstract class ChildService<TData> extends BaseService<TData> implements Service {
  public readonly bot: Bot;

  constructor(options: ChildServiceOptions<TData>) {
    super(options);

    this.bot = options.bot;
  }
}
