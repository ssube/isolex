import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { ArgsParser } from 'src/parser/ArgsParser';
import { EchoParser } from 'src/parser/EchoParser';
import { LexParser } from 'src/parser/LexParser';
import { RegexParser } from 'src/parser/RegexParser';
import { SplitParser } from 'src/parser/SplitParser';
import { YamlParser } from 'src/parser/YamlParser';

export class ParserModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // parsers
    this.bind(kebabCase(ArgsParser.name)).toConstructor(ArgsParser);
    this.bind(kebabCase(EchoParser.name)).toConstructor(EchoParser);
    this.bind(kebabCase(LexParser.name)).toConstructor(LexParser);
    this.bind(kebabCase(RegexParser.name)).toConstructor(RegexParser);
    this.bind(kebabCase(SplitParser.name)).toConstructor(SplitParser);
    this.bind(kebabCase(YamlParser.name)).toConstructor(YamlParser);
  }
}
