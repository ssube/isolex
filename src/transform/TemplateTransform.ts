import { Inject } from 'noicejs';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { ServiceOptions } from 'src/Service';
import { TYPE_JSON } from 'src/utils/Mime';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { BaseTransform } from './BaseTransform';
import { Transform, TransformConfig } from './Transform';

/**
 * Dictionary of templates to be compiled.
 */
export interface TemplateTransformConfig extends TransformConfig {
  templates: {
    [key: string]: string;
  };
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
    for (const [key, data] of Object.entries(options.data.templates)) {
      this.logger.debug({ key }, 'compiling template');
      const template = options.compiler.compile(data);
      this.templates.set(key, template);
    }
  }

  public async transform(cmd: Command, data: any): Promise<Array<any>> {
    const scope = this.mergeScope(cmd, data);
    const out = new Map();
    for (const [key, template] of this.templates) {
      const result = template.render(scope);
      out.set(key, result);
    }
    const body = Array.from(out.entries());
    return [Message.reply(cmd.context, TYPE_JSON, body)];
  }
}
