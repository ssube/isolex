import { exec, ExecOptions, PromiseWithChild } from 'child_process';
import { defaultTo } from 'lodash';
import { Inject } from 'noicejs';
import { Writable } from 'stream';
import { promisify } from 'util';

import { FilterBehavior, FilterData, FilterValue } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { doesExist, mustExist, Optional } from '../utils';
import { Clock } from '../utils/Clock';
import { makeDict, NameValuePair, pairsToMap } from '../utils/Map';
import { BaseFilter, BaseFilterOptions } from './BaseFilter';

export interface ChildStreams {
  stderr: string;
  stdout: string;
}

export type ExecCallback = (
  command: string,
  options: ExecOptions
) => PromiseWithChild<ChildStreams>;

const execPromise: ExecCallback = promisify(exec);

export interface ShellFilterData extends FilterData {
  command: string;
  options: {
    cwd: string;
    env: Array<NameValuePair<string>>;
    timeout: number;
  };
}

export interface ShellFilterOptions extends BaseFilterOptions<ShellFilterData> {
  exec?: ExecCallback;
}

@Inject(INJECT_CLOCK)
export class ShellFilter extends BaseFilter<ShellFilterData> {
  protected clock: Clock;
  protected exec: typeof execPromise;

  constructor(options: ShellFilterOptions) {
    super(options, 'isolex#/definitions/service-filter-shell');

    this.clock = mustExist(options[INJECT_CLOCK]);
    this.exec = defaultTo(options.exec, execPromise);
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    const env = makeDict(pairsToMap(this.data.options.env));
    this.logger.debug({
      command: this.data.command,
      env,
    }, 'executing shell command with environment');

    const child = this.exec(this.data.command, {
      cwd: this.data.options.cwd,
      env,
    });

    // write value to stdin if possible
    if (doesExist(child.child.stdin)) {
      this.logger.debug('writing filter value to shell command');
      await this.writeValue(child.child.stdin, value);
    } else {
      this.logger.warn('shell command has no input stream, cannot write filter value');
    }

    try {
      this.logger.debug({
        child: child.child,
      }, 'waiting for shell command to exit');
      const results = await child;
      this.logger.debug(results, 'executed shell command and collected results');

      if (results.stderr.length > 0) {
        this.logger.warn(results, 'shell command exited with error output');
        return FilterBehavior.Drop;
      }

      return FilterBehavior.Allow;
    } catch (err) {
      this.logger.warn(err, 'shell command exited with error status');
      return FilterBehavior.Drop;
    }
  }

  public writeValue(stream: Writable, value: FilterValue): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      const payload = this.serializeValue(value);
      stream.write(payload, (err: Optional<Error>) => {
        if (doesExist(err)) {
          rej(err);
        } else {
          stream.end(() => {
            res(true);
          });
        }
      });
    });
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
