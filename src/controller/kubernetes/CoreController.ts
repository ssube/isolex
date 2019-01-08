import * as k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { CheckRBAC, Controller, Handler } from 'src/controller';
import { BaseControllerOptions } from 'src/controller/BaseController';
import { KubernetesBaseController, KubernetesBaseControllerData } from 'src/controller/kubernetes/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { mustExist } from 'src/utils';

export const NOUN_POD = 'kubernetes-pod';
export const NOUN_SERVICE = 'kubernetes-service';

export interface CoreControllerData extends KubernetesBaseControllerData {
  default: {
    namespace: string;
  };
}

export type CoreControllerOptions = BaseControllerOptions<CoreControllerData>;

@Inject()
export class KubernetesCoreController extends KubernetesBaseController<CoreControllerData> implements Controller {
  protected client?: k8s.Core_v1Api;

  constructor(options: CoreControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-kubernetes-core', [NOUN_POD, NOUN_SERVICE]);
  }

  public async start() {
    await super.start();

    const config = await this.loadConfig();
    this.client = config.makeApiClient(k8s.Core_v1Api);
  }

  @Handler(NOUN_POD, CommandVerb.List)
  @CheckRBAC()
  public async listPods(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s pods');

    const response = await client.listNamespacedPod(ns);
    this.logger.debug({ pods: response.body }, 'found pods');
    return this.transformJSON(cmd, response.body.items);
  }

  @Handler(NOUN_SERVICE, CommandVerb.List)
  @CheckRBAC()
  public async listServices(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s svcs');

    const response = await client.listNamespacedService(ns);
    this.logger.debug({ pods: response.body }, 'found pods');
    return this.transformJSON(cmd, response.body.items);
  }
}
