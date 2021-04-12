import { defaultWhen, doesExist, mustCoalesce, Optional } from '@apextoaster/js-utils';

import { Context, ContextRedirect } from '../entity/Context';

export function mayCoalesce<T>(...args: Array<Optional<T>>): T | undefined {
  for (const a of args) {
    if (doesExist(a)) {
      return a;
    }
  }

  return undefined;
}

export function redirectContext(original: Context, redirect: ContextRedirect): Context {
  const channel = mustCoalesce(redirect.forces.channel, original.channel, redirect.defaults.channel);
  const target = mayCoalesce(redirect.forces.target, original.target, redirect.defaults.target);
  const loopTarget = defaultWhen(redirect.forces.loopback === true, original.source, target);

  const user = original.user;
  const source = original.source;
  const sourceUser = original.sourceUser;

  return new Context({
    channel,
    source,
    sourceUser,
    target: loopTarget,
    user,
  });
}
