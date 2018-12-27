import { BotServiceData, BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { FilterData } from 'src/filter/Filter';
import { Service, ServiceDefinition } from 'src/Service';

export interface TransformData extends BotServiceData {
  filters: Array<ServiceDefinition<FilterData>>;
}

export type TransformOptions<TData extends TransformData> = BotServiceOptions<TData>;

export interface Transform extends Service {
  check(cmd: Command): Promise<boolean>;

  /**
   * Transform some unstructured data, string or object, into normal command args.
   *
   * Multiple transforms stack to form a `reduce(msg, cmd)`
   */
  transform(cmd: Command, type: string, body: any): Promise<any>;
}
