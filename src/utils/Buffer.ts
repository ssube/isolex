export function concat(chunks: Array<Buffer>): Buffer {
  const len = chunks.map((it) => it.length).reduce((p, c) => p + c, 0);
  return Buffer.concat(chunks, len);
}

export function encode(chunks: Array<Buffer>, encoding: string): string {
  return concat(chunks).toString(encoding);
}
