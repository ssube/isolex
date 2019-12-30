import { spawn } from 'child_process';
import { defaultTo } from 'lodash';
import { Inject } from 'noicejs';

import { FilterBehavior, FilterData, FilterValue } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { doesExist, mustExist } from '../utils';
import { ChildOptions, waitForChild, writeValue, ChildSpawner } from '../utils/Child';
import { Clock } from '../utils/Clock';
import { makeDict, pairsToMap } from '../utils/Map';
import { BaseFilter, BaseFilterOptions } from './BaseFilter';

export interface ShellFilterData extends FilterData {
  child: ChildOptions;
}

export interface ShellFilterOptions extends BaseFilterOptions<ShellFilterData> {
  exec?: ChildSpawner;
}

@Inject(INJECT_CLOCK)
export class ShellFilter extends BaseFilter<ShellFilterData> {
  protected clock: Clock;
  protected exec: ChildSpawner;

  constructor(options: ShellFilterOptions) {
    super(options, 'isolex#/definitions/service-filter-shell');

    this.clock = mustExist(options[INJECT_CLOCK]);
    this.exec = defaultTo(options.exec, spawn);
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    const env = makeDict(pairsToMap(this.data.child.env));
    this.logger.debug({
      command: this.data.child.command,
      env,
    }, 'executing shell command with environment');

    const child = this.exec(this.data.command, [], {
      cwd: this.data.child.cwd,
      env,
      timeout: this.data.child.timeout,
    });

    // write value to stdin if possible
    if (doesExist(child.stdin)) {
      this.logger.debug('writing filter value to shell command');
      await writeValue(child.stdin, this.serializeValue(value));
    } else {
      this.logger.warn('shell command has no input stream, cannot write filter value');
    }

    try {
      this.logger.debug({
        child,
      }, 'waiting for shell command to exit');
      const result = await waitForChild(child);
      this.logger.debug(result, 'executed shell command and collected results');

      return FilterBehavior.Allow;
    } catch (err) {
      this.logger.warn(err, 'shell command exited with error, dropping value');
      return FilterBehavior.Drop;
    }
  }

  protected serializeValue(value: FilterValue): string {
    const meta = JSON.stringify({
      kind: this.kind,
      name: this.name,
      time: this.clock.getSeconds(),
    });
    const data = JSON.stringify(value);
    return `{"metadata": ${meta}, "data": ${data}}\n`;
  }
}
