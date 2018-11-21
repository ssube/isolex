import { Command } from 'src/entity/Command';
import { ParserData } from 'src/parser/Parser';
import { Service, ServiceDefinition, ServiceOptions } from 'src/Service';
import { Message } from 'src/entity/Message';

export interface TransformData {
  parsers: Array<ServiceDefinition<ParserData>>;
}

export type TransformOptions<TData extends TransformData> = ServiceOptions<TData>;

export interface Transform extends Service {
  /**
   * Transform some unstructured data, string or object, into normal command args.
   * 
   * Multiple transforms stack to form a `reduce(msg, cmd)`
   * 
   * The transform may emit multiple objects (if many events were sent at once or many views of the same event).
   */
  transform(cmd: Command, msg: Message): Promise<Array<Message>>;
}