import { Inject } from 'noicejs';

import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { mapToDict } from 'src/utils/Map';
import { TYPE_JSON } from 'src/utils/Mime';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { BaseTransform } from './BaseTransform';
import { Transform, TransformData, TransformOptions } from './Transform';

/**
 * Dictionary of templates to be compiled.
 */
export interface TemplateTransformData extends TransformData {
  templates: {
    [key: string]: string;
  };
}

export interface TemplateTransformOptions extends TransformOptions<TemplateTransformData> {
  compiler: TemplateCompiler;
}

@Inject('compiler')
export class TemplateTransform extends BaseTransform<TemplateTransformData> implements Transform {
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

  public async transform(cmd: Command, msg: Message): Promise<Array<Message>> {
    const scope = this.mergeScope(cmd, msg);
    const out = new Map();
    for (const [key, template] of this.templates) {
      this.logger.debug({ key, scope }, 'rendering template with scope');
      const result = template.render(scope);
      out.set(key, result);
    }
    const body = JSON.stringify(mapToDict(out));
    return [Message.reply(cmd.context, TYPE_JSON, body)];
  }
}
