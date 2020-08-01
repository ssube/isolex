import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { INJECT_STORAGE } from '../BotService';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { Counter } from '../entity/misc/Counter';
import { clamp } from '../utils/Math';
import { BaseController, BaseControllerOptions } from './BaseController';

export const NOUN_COUNTER = 'counter';

export interface CountControllerData extends ControllerData {
  default: {
    count: string;
    name: string;
  };
  field: {
    count: string;
    name: string;
  };
  range: {
    min: number;
    max: number;
  };
}

@Inject(INJECT_STORAGE)
export class CountController extends BaseController<CountControllerData> implements Controller {
  protected readonly counterRepository: Repository<Counter>;

  constructor(options: BaseControllerOptions<CountControllerData>) {
    super(options, 'isolex#/definitions/service-controller-count', [NOUN_COUNTER]);

    this.counterRepository = mustExist(options[INJECT_STORAGE]).getRepository(Counter);
  }

  @Handler(NOUN_COUNTER, CommandVerb.Get)
  @CheckRBAC()
  public async getCounter(cmd: Command, ctx: Context): Promise<void> {
    const count = cmd.getHeadOrDefault(this.data.field.count, this.data.default.count);
    const name = cmd.getHeadOrDefault(this.data.field.name, ctx.channel.thread);

    this.logger.debug({ count, counterName: name }, 'finding counter');
    const counter = await this.findOrCreateCounter(name, ctx.channel.id);

    switch (count) {
      case 'ls':
        const body = await this.listCounters(ctx.channel.id);
        await this.reply(ctx, body);
        break;
      case '++':
        counter.count += 1;
        break;
      case '--':
        counter.count -= 1;
        break;
      default:
        counter.count += clamp(Number(count), this.data.range.max, this.data.range.min);
    }

    this.logger.debug({ count, name }, 'updating counter');
    await this.counterRepository.save(counter);
  }

  @Handler(NOUN_COUNTER, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }

  public async findOrCreateCounter(name: string, roomId: string): Promise<Counter> {
    const counter = await this.counterRepository.findOne({
      where: {
        name,
        roomId,
      },
    });

    if (doesExist(counter)) {
      return counter;
    } else {
      return new Counter({
        count: Number(this.data.default.count),
        name,
        roomId,
      });
    }
  }

  public async listCounters(roomId: string): Promise<string> {
    const counters = await this.counterRepository.find({
      where: {
        roomId,
      },
    });

    if (counters.length > 0) {
      return counters.join('\n');
    } else {
      return 'no counters found';
    }
  }
}
