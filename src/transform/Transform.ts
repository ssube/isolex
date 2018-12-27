import { BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { FilterData } from 'src/filter/Filter';
import { Service, ServiceDefinition } from 'src/Service';

export interface TransformData {
  filters: Array<ServiceDefinition<FilterData>>;
}

export type TransformOptions<TData extends TransformData> = BotServiceOptions<TData>;

export interface Transform extends Service {
  check(cmd: Command): Promise<boolean>;

  /**
   * Transform some unstructured data, string or object, into normal command args.
   *
   * Multiple transforms stack to form a `reduce(msg, cmd)`
   *
   * The transform may send multiple messages (if many events were sent at once or many views of the same event).
   *
   * @TODO check the signature on this
   */
  transform(cmd: Command, msg: Message): Promise<Array<Message>>;
}
