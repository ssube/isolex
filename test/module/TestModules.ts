import { kebabCase } from 'lodash';
import { Container, ConsoleLogger } from 'noicejs';

import { BotModule } from '../../src/module/BotModule';
import { ControllerModule } from '../../src/module/ControllerModule';
import { EndpointModule } from '../../src/module/EndpointModule';
import { EntityModule } from '../../src/module/EntityModule';
import { FilterModule } from '../../src/module/FilterModule';
import { IntervalModule } from '../../src/module/IntervalModule';
import { ListenerModule } from '../../src/module/ListenerModule';
import { MigrationModule } from '../../src/module/MigrationModule';
import { ParserModule } from '../../src/module/ParserModule';
import { TransformModule } from '../../src/module/TransformModule';
import { describeAsync, itAsync } from '../helpers/async';

const MODULE_TYPES = [
  BotModule,
  ControllerModule,
  EndpointModule,
  EntityModule,
  FilterModule,
  IntervalModule,
  ListenerModule,
  MigrationModule,
  ParserModule,
  TransformModule,
];

describeAsync('DI modules', async () => {
  for (const moduleType of MODULE_TYPES) {
    describeAsync(kebabCase(moduleType.name), async () => {
      itAsync('should be configurable', async () => {
        const options = {
          logger: ConsoleLogger.global,
        };
        const container = Container.from(new moduleType(options));
        await container.configure(options);
        container.debug();
      });
    });
  }
});
