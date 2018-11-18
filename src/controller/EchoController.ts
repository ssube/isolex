import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Transform } from 'src/transform/Transform';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';
import { ServiceDefinition } from 'src/Service';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface EchoControllerConfig extends ControllerConfig {
  transforms: Array<ServiceDefinition>;
}

export interface EchoControllerOptions extends ControllerOptions<EchoControllerConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class EchoController extends BaseController<EchoControllerConfig> implements Controller {
  protected readonly transforms: Array<Transform>;

  constructor(options: EchoControllerOptions) {
    super(options);

    this.transforms = [];
  }

  public async start() {
    for (const def of this.data.transforms) {
      const transform = await this.bot.createService<Transform, any>(def);
      this.transforms.push(transform);
    }
  }

  public async handle(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'echoing command');

    let data = Message.reply(cmd.toString(), cmd.context);
    for (const transform of this.transforms) {
      const [head, ...rest] = await transform.transform(cmd, data);
      data = head;
      if (rest.length) {
        this.logger.info({ rest }, 'echo transform discarding extra messages');
      }
    }
    return this.bot.send(data);
  }
}
