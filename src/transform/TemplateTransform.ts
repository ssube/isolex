import { Inject } from 'noicejs';

import { Command } from 'src/entity/Command';
import { BaseTransform } from 'src/transform/BaseTransform';
import { Transform, TransformData, TransformOptions } from 'src/transform/Transform';
import { mapToDict } from 'src/utils/Map';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

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
    super(options, 'isolex#/definitions/service-transform-template');

    this.templates = new Map();
    for (const [key, data] of Object.entries(options.data.templates)) {
      this.logger.debug({ key }, 'compiling template');
      const template = options.compiler.compile(data);
      this.templates.set(key, template);
    }
  }

  public async transform(cmd: Command, type: string, body: any): Promise<any> {
    const scope = this.mergeScope(cmd, body);
    const out = new Map();
    for (const [key, template] of this.templates) {
      this.logger.debug({ key, scope }, 'rendering template with scope');
      const result = template.render(scope);
      out.set(key, result);
    }
    return mapToDict(out);
  }
}
