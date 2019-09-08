import { Inject } from 'noicejs';
import { Registry } from 'prom-client';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { INJECT_METRICS } from '../BaseService';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { mustExist } from '../utils';
import { VERSION_INFO } from '../version';
import { BaseController, BaseControllerOptions } from './BaseController';

export const NOUN_METRIC = 'bot-metric';
export const NOUN_NOUN = 'bot-noun';
export const NOUN_SERVICE = 'bot-service';
export const NOUN_VERSION = 'bot-version';

export type BotControllerData = ControllerData;

@Inject(INJECT_METRICS)
export class BotController extends BaseController<BotControllerData> implements Controller {
  protected readonly metrics: Registry;

  constructor(options: BaseControllerOptions<BotControllerData>) {
    super(options, 'isolex#/definitions/service-controller-bot', [
      NOUN_METRIC,
      NOUN_NOUN,
      NOUN_SERVICE,
      NOUN_VERSION,
    ]);

    this.metrics = mustExist(options[INJECT_METRICS]);
  }

  @Handler(NOUN_METRIC, CommandVerb.Get)
  @CheckRBAC()
  public async getMetrics(cmd: Command, ctx: Context): Promise<void> {
    const name = cmd.getHead('name');
    const metrics = this.metrics.getSingleMetric(name);
    return this.transformJSON(cmd, [metrics]);
  }

  @Handler(NOUN_METRIC, CommandVerb.List)
  @CheckRBAC()
  public async listMetrics(cmd: Command, ctx: Context): Promise<void> {
    const metrics = this.metrics.getMetricsAsArray();
    return this.transformJSON(cmd, metrics);
  }

  @Handler(NOUN_NOUN, CommandVerb.List)
  @CheckRBAC()
  public async listNouns(cmd: Command, ctx: Context): Promise<void> {
    const nouns = [];
    for (const [key, svc] of this.services.listServices()) {
      if (svc instanceof BaseController) {
        for (const noun of svc.getNouns()) {
          nouns.push({
            key,
            noun,
          });
        }
      }
    }
    return this.transformJSON(cmd, nouns);
  }

  @Handler(NOUN_SERVICE, CommandVerb.List)
  @CheckRBAC()
  public async listServices(cmd: Command): Promise<void> {
    const services = Array.from(this.services.listServices());
    return this.transformJSON(cmd, services);
  }

  @Handler(NOUN_VERSION, CommandVerb.Get)
  @CheckRBAC()
  public async getVersion(cmd: Command): Promise<void> {
    return this.transformJSON(cmd, VERSION_INFO);
  }
}
