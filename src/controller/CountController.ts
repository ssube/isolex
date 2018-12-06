import { isNil } from 'lodash';
import { BaseError, Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Counter } from 'src/entity/misc/Counter';
import { clamp } from 'src/utils/Math';
import { TYPE_TEXT } from 'src/utils/Mime';

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
    super({
      ...options,
      nouns: [NOUN_COUNTER],
    });

    if (isNil(options.storage)) {
      throw new BaseError('missing dependencies');
    }

    this.storage = options.storage;
    this.counterRepository = this.storage.getRepository(Counter);
  }

  public async handle(cmd: Command): Promise<void> {
    const count = cmd.getHeadOrDefault(this.data.field.count, this.data.default.count);
    const name = cmd.getHeadOrDefault(this.data.field.name, cmd.context.threadId);

    this.logger.debug({ count, counterName: name }, 'finding counter');
    const counter = await this.findOrCreateCounter(name, cmd.context.roomId);

    switch (count) {
      case 'ls':
        const body = await this.listCounters(cmd.context.roomId);
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, body));
        break;
      case '++':
        ++counter.count;
        break;
      case '--':
        --counter.count;
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

    if (counter) {
      return counter;
    }

    return new Counter({
      count: Number(this.data.default.count),
      name,
      roomId,
    });
  }

  public async listCounters(roomId: string): Promise<string> {
    const counters = await this.counterRepository.find({
      where: {
        roomId,
      },
    });

    if (counters.length) {
      return counters.join('\n');
    } else {
      return 'no counters found';
    }
  }
}
