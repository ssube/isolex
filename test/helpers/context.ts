import { ContextData } from '../../src/entity/Context';

export function getTestContextData(): ContextData {
  return {
    channel: {
      id: 'test',
      thread: 'test',
    },
    source: {
      kind: 'test',
      name: 'test',
    },
    sourceUser: {
      name: 'test',
      uid: 'test',
    },
  };
}
