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
    this.logger.debug({ child: this.data.child }, 'executing shell command');
    const child = this.exec(this.data.child.command, {
      timeout: this.data.child.timeout,
    });

    // turn body into env
    const scope = this.mergeScope(entity, body);

    // turn value into string
    const value = JSON.stringify(entity);
    this.logger.debug({ value }, 'writing value to shell command');
    await writeValue(child.stdin, value);

    // abort on errors
    const results = await waitForChild(child);
    this.logger.debug(results, 'collected results from shell command');

    // parse stdout into output scope
    return JSON.parse(results.stdout);
  }
}
