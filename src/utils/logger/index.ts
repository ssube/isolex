import { kebabCase } from 'lodash';
import { Logger } from 'noicejs';
import { BaseOptions, Constructor } from 'noicejs/Container';

import { Service } from 'src/Service';
import { getConstructor } from 'src/utils';

export function classLogger<TClass, TOptions extends BaseOptions>(base: Logger, ctor: Constructor<TClass, TOptions>) {
  return base.child({
    kind: kebabCase(getConstructor(ctor).name),
  });
}

export function serviceLogger(base: Logger, svc: Service): Logger {
  return base.child({
    kind: kebabCase(getConstructor(svc).name),
    service: svc.name,
  });
}
