import { random } from 'mathjs';

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

  constructor(options: PicklistOptions<T>) {
    this.data = Array.from(options.data);
  }

  public pick(n: number): Array<T> {
    return new Array(n).fill(0).map(() => this.pickOne());
  }

  public pickOne(): T {
    const sum = this.data.reduce((p, d) => p + d.weight, 0);
    let target = random(0, sum);

    for (const d of this.data) {
      target -= d.weight;

      if (target < 0) {
        return d.value;
      }
    }

    throw new Error('no item found');
  }
}
