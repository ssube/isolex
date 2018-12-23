import { setOrPush } from 'src/utils/Map';

export interface ArrayMapperOptions {
  rest: string;
  skip: number;
  take: Array<string>;
}

export class ArrayMapper {
  public readonly rest: string;
  public readonly skip: number;
  public readonly take: Array<string>;

  constructor(options: ArrayMapperOptions) {
    this.rest = options.rest;
    this.skip = options.skip;
    this.take = Array.from(options.take);
  }

  public map(input: Array<string>): Map<string, Array<string>> {
    const result = new Map();
    input.forEach((it, idx) => {
      if (idx < this.skip) {
        return;
      }

      const skipdx = idx - this.skip;
      if (skipdx < this.take.length) {
        setOrPush(result, this.take[skipdx], it);
      } else {
        setOrPush(result, this.rest, it);
      }
    });

    if (!result.has(this.rest)) {
      result.set(this.rest, []);
    }

    return result;
  }
}
