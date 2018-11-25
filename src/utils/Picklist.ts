import { random } from 'mathjs';

import { NotFoundError } from 'src/error/NotFoundError';

export interface PickItem<T> {
  value: T;
  weight: number;
}

export interface PicklistOptions<T> {
  data: Array<PickItem<T>>;
}

export class Picklist<T> implements PicklistOptions<T> {
  public static create<T>(...items: Array<T>): Picklist<T> {
    return new Picklist({
      data: items.map((it) => {
        return {
          value: it,
          weight: 1,
        };
      }),
    });
  }

  public readonly data: Array<PickItem<T>>;
  public readonly sum: number;

  constructor(options: PicklistOptions<T>) {
    this.data = Array.from(options.data);
    this.sum = this.data.reduce((p, d) => p + d.weight, 0);
  }

  public pick(n: number): Array<T> {
    return new Array(n).fill(0).map(() => this.pickOne());
  }

  public pickOne(): T {
    let target = random(0, this.sum);

    for (const d of this.data) {
      target -= d.weight;

      if (target < 0) {
        return d.value;
      }
    }

    throw new NotFoundError('no item found');
  }
}
