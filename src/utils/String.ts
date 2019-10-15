
export function leftPad(val: string, min: number = 8, fill: string = '0'): string {
  if (val.length < min) {
    const len = min - val.length;
    const pre = Array(len).fill(fill).join('').slice(0, len);
    return `${pre}${val}`;
  } else {
    return val;
  }
}
