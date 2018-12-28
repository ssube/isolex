import * as k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';

export const NOUN_POD = 'pod';
export const NOUN_SERVICE = 'service';

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
export class KubernetesController extends BaseController<KubernetesControllerData> implements Controller {
  protected client: k8s.Core_v1Api;

  constructor(options: KubernetesControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-kubernetes', [NOUN_POD, NOUN_SERVICE]);
  }

  public async start() {
    await super.start();

    const config = await this.loadConfig();
    this.client = config.makeApiClient(k8s.Core_v1Api);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_POD:
        return this.handlePods(cmd);
      case NOUN_SERVICE:
        return this.handleServices(cmd);
      default:
        throw new InvalidArgumentError(`unknown kind: ${cmd.noun}`);
    }
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

  protected async handlePods(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.List:
        return this.listPods(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  protected async handleServices(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.List:
        return this.listServices(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  protected async listPods(cmd: Command): Promise<void> {
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s pods');

    const response = await this.client.listNamespacedPod(ns);
    this.logger.debug({ pods: response.body }, 'found pods');
    return this.transformJSON(cmd, response.body.items);
  }

  protected async listServices(cmd: Command): Promise<void> {
    const ns = cmd.getHeadOrDefault('ns', this.data.default.namespace);
    this.logger.debug({ cmd, ns }, 'listing k8s svcs');

    const response = await this.client.listNamespacedService(ns);
    this.logger.debug({ pods: response.body }, 'found pods');
    return this.transformJSON(cmd, response.body.items);
  }
}
