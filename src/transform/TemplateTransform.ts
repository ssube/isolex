import { Inject } from 'noicejs';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { ServiceOptions } from 'src/Service';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { BaseTransform } from './BaseTransform';
import { Transform } from './Transform';

/**
 * Dictionary of templates to be compiled.
 */
export interface TemplateTransformConfig {
  [key: string]: string;
}

export interface TemplateTransformOptions extends ServiceOptions<TemplateTransformConfig> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class TemplateTransform extends BaseTransform<TemplateTransformConfig> implements Transform {
  protected readonly templates: Map<string, Template>;

  constructor(options: TemplateTransformOptions) {
    super(options);

    this.templates = new Map();
    for (const [key, data] of Object.entries(options.data)) {
      this.logger.debug({ key }, 'compiling template');
      const template = options.compiler.compile(data);
      this.templates.set(key, template);
    }
  }

  public async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    const names = cmd.get('name');
    if (!names || !names.length) {
      throw new InvalidArgumentError('name argument is required');
    }
    return [msg];
  }
}