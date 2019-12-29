export function appendBuffers(chunks: Array<Buffer>): Buffer {
  const len = chunks.map((it) => it.length).reduce((p, c) => p + c, 0);
  return Buffer.concat(chunks, len);
}
