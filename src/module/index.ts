import { Logger, Module } from 'noicejs';

import { BotDefinition } from '../Bot';
import { ModuleCtor } from '../utils/ExternalModule';
import { ControllerModule } from './ControllerModule';
import { EndpointModule } from './EndpointModule';
import { EntityModule } from './EntityModule';
import { FilterModule } from './FilterModule';
import { GeneratorModule } from './GeneratorModule';
import { ListenerModule } from './ListenerModule';
import { MigrationModule } from './MigrationModule';
import { ParserModule } from './ParserModule';
import { TransformModule } from './TransformModule';

const MAIN_MODULES = [
  ControllerModule,
  EndpointModule,
  EntityModule,
  FilterModule,
  GeneratorModule,
  ListenerModule,
  MigrationModule,
  ParserModule,
  TransformModule,
];

export function mainModules() {
  const modules: Array<Module> = [];

  for (const m of MAIN_MODULES) {
    modules.push(new m());
  }

  return modules;
}

export async function loadModules(config: BotDefinition, logger: Logger) {
  const modules: Array<Module> = [];

  for (const p of config.data.modules) {
    try {
      const nodeModule = require(p.require);
      const moduleType = nodeModule[p.export] as ModuleCtor;

      // TODO: verify this is a module constructor before instantiating
      const module = new moduleType(p.data);
      modules.push(module);
    } catch (err) {
      logger.error(err, 'error loading external module', p);
    }
  }

  return modules;
}
