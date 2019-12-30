import { spawn } from 'child_process';
import { defaultTo } from 'lodash';

import { Transform, TransformData } from '.';
import { FilterValue } from '../filter';
import { ChildOptions, ChildSpawner, waitForChild, writeValue } from '../utils/Child';
import { TemplateScope } from '../utils/Template';
import { BaseTransform, BaseTransformOptions } from './BaseTransform';

export interface ShellTransformData extends TransformData {
  child: ChildOptions;
}

export interface ShellTransformOptions extends BaseTransformOptions<ShellTransformData> {
  exec?: ChildSpawner;
}

export class ShellTransform extends BaseTransform<ShellTransformData> implements Transform {
  protected exec: ChildSpawner;

  constructor(options: ShellTransformOptions) {
    super(options, 'isolex#/definitions/service-transform-shell');

    this.exec = defaultTo(options.exec, spawn);
  }

  public async transform(entity: FilterValue, type: string, body: TemplateScope): Promise<TemplateScope> {
    // execute command and collect stdout
    const child = this.exec(this.data.child.command, {
      timeout: this.data.child.timeout,
    });

    // turn body into env
    const scope = this.mergeScope(entity, body);

    // turn value into string
    const value = JSON.stringify(entity);
    await writeValue(child.stdin, value);

    // abort on errors
    const results = await waitForChild(child);

    // parse stdout into output scope
    return JSON.parse(results.stdout);
  }
}
