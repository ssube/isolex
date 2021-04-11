import { defaultWhen, mustCoalesce } from '@apextoaster/js-utils';

import { Context, ContextRedirect } from '../entity/Context';

export function redirectContext(original: Context, redirect: ContextRedirect): Context {
  const channel = mustCoalesce(redirect.forces.channel, original.channel, redirect.defaults.channel);
  const target = mustCoalesce(redirect.forces.target, original.target, redirect.defaults.target);
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
