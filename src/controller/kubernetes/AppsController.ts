import * as k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { Controller, ControllerOptions } from 'src/controller/Controller';
import { KubernetesBaseController, KubernetesBaseControllerData } from 'src/controller/kubernetes/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { mustExist } from 'src/utils';

export const NOUN_DEPLOYMENT = 'kubernetes-deployment';

export interface AppsControllerData extends KubernetesBaseControllerData {
  default: {
    namespace: string;
  };
}

export type AppsControllerOptions = ControllerOptions<AppsControllerData>;

@Inject()
export class KubernetesAppsController extends KubernetesBaseController<AppsControllerData> implements Controller {
  protected client?: k8s.Apps_v1Api;

  constructor(options: AppsControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-kubernetes-apps', [NOUN_DEPLOYMENT]);
  }

  public async start() {
    await super.start();

    const config = await this.loadConfig();
    this.client = config.makeApiClient(k8s.Apps_v1Api);
  }

  @Handler(NOUN_DEPLOYMENT, CommandVerb.List)
  @CheckRBAC()
  public async listDeployments(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s deployments');

    const response = await client.listNamespacedDeployment(ns);
    this.logger.debug({ deployments: response.body }, 'found deployments');
    return this.transformJSON(cmd, response.body.items);
  }
}
