import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module, Provides } from 'noicejs';
import { Constructor } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { ModuleOptions } from 'noicejs/Module';
import { Registry } from 'prom-client';
import { Connection, Repository } from 'typeorm';

import {
  INJECT_CLOCK,
  INJECT_LOGGER,
  INJECT_METRICS,
  INJECT_SCHEMA,
  INJECT_SERVICES,
  INJECT_TEMPLATE,
} from 'src/BaseService';
import { Bot } from 'src/Bot';
import { BotServiceData, BotServiceOptions, INJECT_BOT, INJECT_LOCALE, INJECT_STORAGE } from 'src/BotService';
import { Locale } from 'src/locale';
import { ServiceModule } from 'src/module/ServiceModule';
import { Schema } from 'src/schema';
import { ServiceDefinition } from 'src/Service';
import { Clock } from 'src/utils/Clock';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export class TestModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind(INJECT_TEMPLATE).toConstructor(TemplateCompiler);
  }

  @Provides(INJECT_LOGGER)
  public async getLogger(): Promise<Logger> {
    return ConsoleLogger.global;
  }
}

export async function createContainer(...modules: Array<Module>): Promise<{ container: Container, module: Module }> {
  const module = new TestModule();
  const container = Container.from(module, ...modules);
  await container.configure();
  return { container, module };
}

export async function createService<
  TService,
  TData extends BotServiceData,
  TOptions extends BotServiceOptions<TData> = BotServiceOptions<TData>,
>(
  container: Container,
  type: Constructor<TService, TOptions>,
  options: Partial<TOptions>,
): Promise<TService> {
  const services = ineeda<ServiceModule>({
      createService: (def: ServiceDefinition<TData>) => container.create(def.metadata.kind, def),
    });
  const schema = new Schema(); // tests use the real schema :D
  const locale = await container.create(Locale, {
    data: {
      lang: 'en',
    },
    metadata: {
      kind: 'locale',
      name: 'locale',
    },
    [INJECT_LOGGER]: ConsoleLogger.global,
    [INJECT_SCHEMA]: schema,
    [INJECT_SERVICES]: services,
  });

  const fullOptions = {
    [INJECT_BOT]: ineeda<Bot>(),
    [INJECT_CLOCK]: ineeda<Clock>(),
    [INJECT_TEMPLATE]: ineeda<TemplateCompiler>({
      compile: () => ineeda<Template>(),
    }),
    [INJECT_LOCALE]: locale,
    [INJECT_LOGGER]: ConsoleLogger.global,
    [INJECT_METRICS]: new Registry(),
    [INJECT_SCHEMA]: schema,
    [INJECT_SERVICES]: services,
    [INJECT_STORAGE]: ineeda<Connection>({
      getRepository<T>(ctor: T) {
        return ineeda<Repository<T>>();
      },
    }),
    container,
    ...options,
  };

  return container.create(type, fullOptions);
}
