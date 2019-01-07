import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module, Provides } from 'noicejs';
import { Constructor } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { ModuleOptions } from 'noicejs/Module';
import { Registry } from 'prom-client';
import { Connection } from 'typeorm';

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

    this.bind('compiler').toConstructor(TemplateCompiler);
  }

  @Provides('logger')
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
  const fullOptions = {
    [INJECT_BOT]: ineeda<Bot>(),
    [INJECT_CLOCK]: ineeda<Clock>(),
    [INJECT_TEMPLATE]: ineeda<TemplateCompiler>({
      compile: () => ineeda<Template>(),
    }),
    container,
    [INJECT_LOCALE]: new Locale({
      container,
      lang: 'en',
      [INJECT_LOGGER]: ConsoleLogger.global,
    }),
    [INJECT_LOGGER]: ConsoleLogger.global,
    [INJECT_METRICS]: new Registry(),
    [INJECT_SCHEMA]: new Schema(), // tests use the real schema :D
    [INJECT_SERVICES]: ineeda<ServiceModule>({
      createService: (def: ServiceDefinition<TData>) => container.create(def.metadata.kind, def),
    }),
    [INJECT_STORAGE]: ineeda<Connection>(),
    ...options,
  };

  return container.create(type, fullOptions);
}
