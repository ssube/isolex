import { kebabCase } from 'lodash';
import { ConsoleLogger, Container } from 'noicejs';

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
import { describeLeaks, itLeaks } from '../helpers/async';

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

describeLeaks('DI modules', async () => {
  for (const moduleType of MODULE_TYPES) {
    describeLeaks(kebabCase(moduleType.name), async () => {
      itLeaks('should be configurable', async () => {
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
