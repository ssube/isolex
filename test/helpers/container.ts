import { ConsoleLogger, Container, Module, Provides } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { ModuleOptions } from 'noicejs/Module';
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
