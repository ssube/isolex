import { Command } from 'src/entity/Command';
import { ParserConfig } from 'src/parser/Parser';
import { Service, ServiceDefinition, ServiceOptions } from 'src/Service';

export interface TransformConfig {
  parsers: Array<ServiceDefinition<ParserConfig>>;
}

export type TransformOptions<TData extends TransformConfig> = ServiceOptions<TData>;

export interface Transform extends Service {
  /**
   * Transform some unstructured data, string or object, into normal command args.
   * 
   * Multiple transforms stack to form a `reduce(msg, cmd)`
   * 
   * The transform may emit multiple objects (if many events were sent at once or many views of the same event).
   */
  transform(cmd: Command, data: any): Promise<Array<any>>;
}