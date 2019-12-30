export function concat(chunks: Array<Buffer>): Buffer {
  const sum = chunks.map((it) => it.length).reduce((p, c) => p + c, 0);
  return Buffer.concat(chunks, sum);
}

export function encode(chunks: Array<Buffer>, encoding: string): string {
  if (chunks.length === 0) {
    return '';
  }

  return concat(chunks).toString(encoding);
}
