import { isMap } from 'lodash';

export function defer<T = undefined>(ms: number, val?: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => res(val), ms);
  });
}

export function leftPad(val: string, min: number = 8, fill: string = '0'): string {
  if (val.length < min) {
    const pre = Array(min - val.length).fill(fill).join('');
    return `${pre}${val}`;
  } else {
    return val;
  }
}

export function countList(val: any): number {
  if (Array.isArray(val)) {
    return val.length;
  } else {
    return 1;
  }
}

export function mergeList<TVal extends TItem | Array<TItem>, TItem>(prev: TVal, next: TVal): Array<TItem> {
  const out = [];

  if (Array.isArray(prev)) {
    out.push(...prev);
  } else {
    out.push(prev);
  }

  if (Array.isArray(next)) {
    out.push(...next);
  } else {
    out.push(next);
  }

  return out;
}

export function setOrPush<TKey, TVal>(map: Map<TKey, Array<TVal>>, key: TKey, val: TVal | Array<TVal>) {
  const prev = map.get(key);
  if (prev) {
    map.set(key, mergeList(prev, val));
  } else {
    if (Array.isArray(val)) {
      map.set(key, val);
    } else {
      map.set(key, [val]);
    }
  }
}

export function mergeMap<TKey, TVal>(...args: Array<Map<TKey, TVal | Array<TVal>>>): Map<TKey, Array<TVal>> {
  const out = new Map();
  for (const arg of args) {
    for (const [key, val] of arg) {
      setOrPush(out, key, val);
    }
  }
  return out;
}

interface FakeMap<TVal> {
  [key: string]: TVal;
}

export function normalizeMap<TVal>(val: Map<string, TVal> | FakeMap<TVal>): Map<string, TVal> {
  if (isMap(val)) {
    return new Map(val.entries());
  } else {
    return new Map(Object.entries(val));
  }
}
