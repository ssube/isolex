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

  public async transform(value: FilterValue, type: string, scope: TemplateScope): Promise<TemplateScope> {
    // execute command and collect stdout
    this.logger.debug({ child: this.data.child }, 'executing shell command');
    const child = this.exec(this.data.child.command, this.data.child.args, {
      timeout: this.data.child.timeout,
    });

    // merge value and body, send to child
    const payload = JSON.stringify({
      scope,
      value,
    });
    this.logger.debug({ value }, 'writing value to shell command');
    await writeValue(child.stdin, payload);

    // abort on errors
    const results = await waitForChild(child);
    this.logger.debug(results, 'collected results from shell command');

    // parse stdout into output scope
    return JSON.parse(results.stdout);
  }
}
