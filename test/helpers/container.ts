import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module, Provides } from 'noicejs';
import { Constructor } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { ModuleOptions } from 'noicejs/Module';
import { Registry } from 'prom-client';
import { Connection } from 'typeorm';

import { BaseServiceOptions } from 'src/BaseService';
import { Bot } from 'src/Bot';
import { ServiceModule } from 'src/module/ServiceModule';
import { Schema } from 'src/schema';
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

export async function createContainer(): Promise<{ container: Container, module: Module }> {
  const module = new TestModule();
  const container = Container.from(module);
  await container.configure();
  return { container, module };
}

export async function createService<TService, TOptions extends BaseServiceOptions<any>>(
  container: Container,
  type: Constructor<TService, TOptions>,
  options: Partial<TOptions>,
): Promise<TService> {
  const fullOptions = {
    bot: ineeda<Bot>(),
    clock: ineeda<Clock>(),
    compiler: ineeda<TemplateCompiler>({
      compile: () => ineeda<Template>(),
    }),
    container,
    logger: ConsoleLogger.global,
    metrics: new Registry(),
    schema: new Schema(), // tests use the real schema :D
    services: ineeda<ServiceModule>(),
    storage: ineeda<Connection>(),
    ...options,
  };

  return container.create(type, fullOptions);
}
