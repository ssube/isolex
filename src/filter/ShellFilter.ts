import { exec } from 'child_process';
import { Writable } from 'stream';
import { promisify } from 'util';

import { FilterBehavior, FilterData, FilterValue } from '.';
import { doesExist, Optional } from '../utils';
import { NameValuePair, Dict } from '../utils/Map';
import { BaseFilter, BaseFilterOptions } from './BaseFilter';

const execPromise = promisify(exec);

export interface ShellFilterData extends FilterData {
  command: string;
  options: {
    cwd: string;
    env: Dict<string>; // TODO: should be an Array<NameValuePair<string>>;
    timeout: number;
  };
}

export class ShellFilter extends BaseFilter<ShellFilterData> {
  constructor(options: BaseFilterOptions<ShellFilterData>) {
    super(options, 'isolex#/definitions/service-filter-shell');
  }

  public async check(value: FilterValue): Promise<FilterBehavior> {
    const child = execPromise(this.data.command, this.data.options);

    if (doesExist(child.child.stdin)) {
      await this.writeValue(child.child.stdin, value);
    } else {
      this.logger.warn('no stdin stream to write filter value');
    }

    const {
      stderr,
      stdout,
    } = await child;

    if (stderr.length > 0) {
      this.logger.warn({
        stderr,
        stdout,
      }, 'error from shell command');
      return FilterBehavior.Drop;
    } else {
      return FilterBehavior.Allow;
    }
  }

  public async writeValue(stream: Writable, value: FilterValue): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      const data = JSON.stringify(value);
      stream.write(`{"test": "hello world!", "data": ${data}}`, (err: Optional<Error>) => {
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
}
