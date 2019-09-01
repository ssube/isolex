import { ModuleOptions } from 'noicejs';

import { ArgsParser } from '../parser/ArgsParser';
import { EchoParser } from '../parser/EchoParser';
import { LexParser } from '../parser/LexParser';
import { RegexParser } from '../parser/RegexParser';
import { SplitParser } from '../parser/SplitParser';
import { YamlParser } from '../parser/YamlParser';
import { BaseModule } from './BaseModule';

export class ParserModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // parsers
    this.bindService(ArgsParser);
    this.bindService(EchoParser);
    this.bindService(LexParser);
    this.bindService(RegexParser);
    this.bindService(SplitParser);
    this.bindService(YamlParser);
  }
}
