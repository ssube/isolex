import { mustExist } from '@apextoaster/js-utils';
import k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { CheckRBAC, Controller, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { BaseControllerOptions } from '../BaseController';
import { KubernetesBaseController, KubernetesBaseControllerData } from './BaseController';

export const NOUN_DAEMONSET = 'kubernetes-daemonset';
export const NOUN_DEPLOYMENT = 'kubernetes-deployment';
export const NOUN_STATEFULSET = 'kubernetes-statefulset';

export interface AppsControllerData extends KubernetesBaseControllerData {
  default: {
    namespace: string;
  };
}

@Inject()
export class KubernetesAppsController extends KubernetesBaseController<AppsControllerData> implements Controller {
  protected client?: k8s.AppsV1Api;

  constructor(options: BaseControllerOptions<AppsControllerData>) {
    super(options, 'isolex#/definitions/service-controller-kubernetes-apps', [
      NOUN_DAEMONSET,
      NOUN_DEPLOYMENT,
      NOUN_STATEFULSET,
    ]);
  }

  public async start() {
    await super.start();

    const config = await this.loadConfig();
    this.client = config.makeApiClient(k8s.AppsV1Api);
  }

  @Handler(NOUN_DAEMONSET, CommandVerb.List)
  @CheckRBAC()
  public async listDaemons(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s daemon sets');

    const response = await client.listNamespacedDaemonSet(ns);
    return this.transformJSON(cmd, response.body.items);
  }

  @Handler(NOUN_DEPLOYMENT, CommandVerb.List)
  @CheckRBAC()
  public async listDeploys(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s deployments');

    const response = await client.listNamespacedDeployment(ns);
    return this.transformJSON(cmd, response.body.items);
  }

  @Handler(NOUN_DEPLOYMENT, CommandVerb.Update)
  @CheckRBAC()
  public async updateDeploys(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const name = cmd.getHead('name');
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    const replicas = cmd.getHeadOrNumber('replicas', 1);

    this.logger.debug({ cmd, name, ns, replicas }, 'scaling k8s deployments');

    const response = await client.patchNamespacedDeploymentScale(name, ns, {
      spec: {
        replicas,
      },
    });

    const status = mustExist(response.body.status);
    return this.transformJSON(cmd, status);
  }

  @Handler(NOUN_STATEFULSET, CommandVerb.List)
  @CheckRBAC()
  public async listStatefuls(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s stateful sets');

    const response = await client.listNamespacedStatefulSet(ns);
    return this.transformJSON(cmd, response.body.items);
  }

  @Handler(NOUN_STATEFULSET, CommandVerb.Update)
  @CheckRBAC()
  public async updateStateful(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const name = cmd.getHead('name');
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    const replicas = cmd.getHeadOrNumber('replicas', 1);

    this.logger.debug({ cmd, name, ns, replicas }, 'scaling k8s stateful sets');

    const response = await client.patchNamespacedStatefulSetScale(name, ns, {
      spec: {
        replicas,
      },
    });

    const status = mustExist(response.body.status);
    return this.transformJSON(cmd, status);
  }
}
