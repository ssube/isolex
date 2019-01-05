import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Counter } from 'src/entity/misc/Counter';
import { clamp } from 'src/utils/Math';

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

export type CountControllerOptions = ControllerOptions<CountControllerData>;

@Inject('storage')
export class CountController extends BaseController<CountControllerData> implements Controller {
  protected storage: Connection;
  protected counterRepository: Repository<Counter>;

  constructor(options: CountControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-count', [NOUN_COUNTER]);

    this.storage = options.storage;
    this.counterRepository = this.storage.getRepository(Counter);
  }

  @HandleNoun(NOUN_COUNTER)
  @HandleVerb(CommandVerb.Get)
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

  public async findOrCreateCounter(name: string, roomId: string): Promise<Counter> {
    const counter = await this.counterRepository.findOne({
      where: {
        name,
        roomId,
      },
    });

    if (isNil(counter)) {
      return new Counter({
        count: Number(this.data.default.count),
        name,
        roomId,
      });
    } else {
      return counter;
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
