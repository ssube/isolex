import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { spy } from 'sinon';

import { Bot } from 'src/Bot';
import { EchoHandler, EchoHandlerOptions } from 'src/handler/EchoHandler';
import { describeAsync, itAsync } from 'test/helpers/async';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

describeAsync('echo handler', async () => {
  itAsync('should copy data', async () => {
    const container = Container.from();
    await container.configure();

    const options: EchoHandlerOptions = {
      bot: ineeda<Bot>(),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>()
      }),
      config: {
        pattern: ''
      },
      container,
      logger: ConsoleLogger.global,
    };
    const handler = await container.create(EchoHandler, options);
    expect(handler).to.be.an.instanceOf(EchoHandler);
  });
});
