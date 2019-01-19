import { kebabCase } from 'lodash';
import { BaseOptions, Constructor, Logger } from 'noicejs';

import { Service } from 'src/Service';
import { getConstructor } from 'src/utils';

export function classLogger<TClass, TOptions extends BaseOptions>(base: Logger, ctor: Constructor<TClass, TOptions>) {
  return kindLogger(base, getConstructor(ctor).name);
}

export function kindLogger(base: Logger, kind: string, options = {}) {
  return base.child({
    ...options,
    kind: kebabCase(kind),
  });
}

export function serviceLogger(base: Logger, svc: Service): Logger {
  return kindLogger(base, getConstructor(svc).name, {
    service: svc.name,
  });
}
