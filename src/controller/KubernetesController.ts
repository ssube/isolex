import * as k8s from '@kubernetes/client-node';
import { Inject } from 'noicejs';

import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { TYPE_JSON } from 'src/utils/Mime';

import { BaseController } from './BaseController';
import { Controller, ControllerData, ControllerOptions } from './Controller';

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

@Inject('bot')
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
        return this.handleSvcs(cmd);
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
    const verb = cmd.getHeadOrDefault('verb', CommandVerb.Get);
    const namespace = cmd.getHeadOrDefault('args', this.data.default.namespace);
    this.logger.debug({ cmd, namespace, verb }, 'doing something with k8s pods');

    if (cmd.verb === CommandVerb.Get) {
      const response = await this.client.listNamespacedPod(namespace);
      this.logger.debug({ pods: response.body }, 'found pods');
      return this.transformItems(cmd, response.body.items);
    }

    throw new InvalidArgumentError(`unknown pod verb: ${verb}`);
  }

  protected async handleSvcs(cmd: Command): Promise<void> {
    const verb = cmd.getHeadOrDefault('verb', CommandVerb.Get);
    const namespace = cmd.getHeadOrDefault('args', this.data.default.namespace);
    this.logger.debug({ cmd, namespace, verb }, 'doing something with k8s svcs');

    if (cmd.verb === CommandVerb.Get) {
      const response = await this.client.listNamespacedService(namespace);
      this.logger.debug({ pods: response.body }, 'found pods');
      return this.transformItems(cmd, response.body.items);
    }

    throw new InvalidArgumentError(`unknown pod verb: ${verb}`);
  }

  protected async transformItems(cmd: Command, items: Array<any>): Promise<void> {
    const messages = await this.transform(cmd, Message.reply(cmd.context, TYPE_JSON, JSON.stringify(items)));
    await this.bot.sendMessage(...messages);
    return;
  }
}
