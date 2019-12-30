import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { defaultTo } from 'lodash';
import { Inject, BaseError } from 'noicejs';
import { Writable } from 'stream';

import { FilterBehavior, FilterData, FilterValue } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { ChildProcessError } from '../error/ChildProcessError';
import { doesExist, mustExist, Optional } from '../utils';
import { encode } from '../utils/Buffer';
import { Clock } from '../utils/Clock';
import { makeDict, NameValuePair, pairsToMap } from '../utils/Map';
import { BaseFilter, BaseFilterOptions } from './BaseFilter';

export interface ChildResult {
  status: number;
  stderr: string;
  stdout: string;
}

export type ExecCallback = typeof spawn;

export interface ShellFilterData extends FilterData {
  command: string;
  options: {
    cwd: string;
    env: Array<NameValuePair<string>>;
    timeout: number;
  };
}

export interface ShellFilterOptions extends BaseFilterOptions<ShellFilterData> {
  exec?: typeof spawn;
}

@Inject(INJECT_CLOCK)
export class ShellFilter extends BaseFilter<ShellFilterData> {
  protected clock: Clock;
  protected exec: typeof spawn;

  constructor(options: ShellFilterOptions) {
    super(options, 'isolex#/definitions/service-filter-shell');

    this.clock = mustExist(options[INJECT_CLOCK]);
    this.exec = defaultTo(options.exec, spawn);
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    const env = makeDict(pairsToMap(this.data.options.env));
    this.logger.debug({
      command: this.data.command,
      env,
    }, 'executing shell command with environment');

    const child = this.exec(this.data.command, [], {
      cwd: this.data.options.cwd,
      env,
    });

    // write value to stdin if possible
    if (doesExist(child.stdin)) {
      this.logger.debug('writing filter value to shell command');
      await this.writeValue(child.stdin, value);
    } else {
      this.logger.warn('shell command has no input stream, cannot write filter value');
    }

    try {
      this.logger.debug({
        child,
      }, 'waiting for shell command to exit');
      const result = await this.waitForChild(child);
      this.logger.debug(result, 'executed shell command and collected results');

      if (result.stderr.length > 0) {
        this.logger.warn(result, 'shell command exited with error output');
        return FilterBehavior.Drop;
      }

      return FilterBehavior.Allow;
    } catch (err) {
      this.logger.warn(err, 'shell command exited with error status');
      return FilterBehavior.Drop;
    }
  }

  public waitForChild(child: ChildProcessWithoutNullStreams): Promise<ChildResult> {
    return new Promise((res, rej) => {
      const stderr: Array<Buffer> = [];
      const stdout: Array<Buffer> = [];

      child.stderr.on('data', (chunk) => {
        stderr.push(chunk);
      });

      child.stdout.on('data', (chunk) => {
        stdout.push(chunk);
      });

      child.on('close', (status: number) => {
        this.logger.debug({ status }, 'child exited with status');
        if (status === 0) {
          res({
            status,
            stderr: encode(stderr, 'utf-8'),
            stdout: encode(stdout, 'utf-8'),
          });
        } else {
          const inner = encode(stderr, 'utf-8');
          rej(new ChildProcessError(
            `child process exited with error status: ${status}`,
            new BaseError(inner)
          ));
        }
      });
    });
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
