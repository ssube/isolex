import { ModuleOptions } from 'noicejs';

import { BaseModule } from 'src/module/BaseModule';
import { ArgsParser } from 'src/parser/ArgsParser';
import { EchoParser } from 'src/parser/EchoParser';
import { LexParser } from 'src/parser/LexParser';
import { RegexParser } from 'src/parser/RegexParser';
import { SplitParser } from 'src/parser/SplitParser';
import { YamlParser } from 'src/parser/YamlParser';

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
