import * as k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { doesExist } from 'src/utils';

export const NOUN_POD = 'kubernetes-pod';
export const NOUN_SERVICE = 'kubernetes-service';

export interface KubernetesBaseControllerData extends ControllerData {
  context: {
    cluster: boolean;
    default: boolean;
    path?: string;
  };
}

export type KubernetesBaseControllerOptions<TData extends KubernetesBaseControllerData> = ControllerOptions<TData>;

@Inject()
export class KubernetesBaseController<TData extends KubernetesBaseControllerData> extends BaseController<TData> implements Controller {
  constructor(options: KubernetesBaseControllerOptions<TData>, schemaPath: string, nouns: Array<string>) {
    super(options, schemaPath, nouns);
  }

  protected async loadConfig() {
    const config = new k8s.KubeConfig();
    if (this.data.context.default) {
      config.loadFromDefault();
    }
    if (this.data.context.cluster) {
      config.loadFromCluster();
    }
    if (doesExist(this.data.context.path)) {
      config.loadFromFile(this.data.context.path);
    }
    return config;
  }
}
