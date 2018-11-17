import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { EchoParser } from 'src/parser/EchoParser';
import { LexParser } from 'src/parser/LexParser';
import { MapParser } from 'src/parser/MapParser';
import { SplitParser } from 'src/parser/SplitParser';
import { YamlParser } from 'src/parser/YamlParser';
import { RegexParser } from 'src/parser/RegexParser';

export class ParserModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // parsers
    this.bind(kebabCase(EchoParser.name)).toConstructor(EchoParser);
    this.bind(kebabCase(LexParser.name)).toConstructor(LexParser);
    this.bind(kebabCase(MapParser.name)).toConstructor(MapParser);
    this.bind(kebabCase(RegexParser.name)).toConstructor(RegexParser);
    this.bind(kebabCase(SplitParser.name)).toConstructor(SplitParser);
    this.bind(kebabCase(YamlParser.name)).toConstructor(YamlParser);
  }
}
