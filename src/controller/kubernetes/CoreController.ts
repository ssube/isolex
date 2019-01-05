import * as k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { mustExist } from 'src/utils';

export const NOUN_POD = 'kubernetes-pod';
export const NOUN_SERVICE = 'kubernetes-service';

export interface KubernetesControllerData extends ControllerData {
  context: {
    cluster: boolean;
    default: boolean;
    path: string;
  };
  default: {
    namespace: string;
  };
}

export type KubernetesControllerOptions = ControllerOptions<KubernetesControllerData>;

@Inject()
export class KubernetesCoreController extends BaseController<KubernetesControllerData> implements Controller {
  protected client?: k8s.Core_v1Api;

  constructor(options: KubernetesControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-kubernetes', [NOUN_POD, NOUN_SERVICE]);
  }

  public async start() {
    await super.start();

    const config = await this.loadConfig();
    this.client = config.makeApiClient(k8s.Core_v1Api);
  }

  @HandleNoun(NOUN_POD)
  @HandleVerb(CommandVerb.List)
  @CheckRBAC()
  public async listPods(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s pods');

    const response = await client.listNamespacedPod(ns);
    this.logger.debug({ pods: response.body }, 'found pods');
    return this.transformJSON(cmd, response.body.items);
  }

  @HandleNoun(NOUN_SERVICE)
  @HandleVerb(CommandVerb.List)
  @CheckRBAC()
  public async listServices(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s svcs');

    const response = await client.listNamespacedService(ns);
    this.logger.debug({ pods: response.body }, 'found pods');
    return this.transformJSON(cmd, response.body.items);
  }

  protected async loadConfig() {
    const config = new k8s.KubeConfig();
    if (this.data.context.default) {
      config.loadFromDefault();
    }
    if (this.data.context.cluster) {
      config.loadFromCluster();
    }
    if (this.data.context.path) {
      config.loadFromFile(this.data.context.path);
    }
    return config;
  }
}
