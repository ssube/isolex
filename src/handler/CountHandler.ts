import { Inject } from 'noicejs';
import { Command } from 'src/entity/Command';
import { Counter } from 'src/entity/Counter';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { Picklist } from 'src/utils/Picklist';
import { Connection, Repository } from 'typeorm';

export interface CountHandlerConfig extends HandlerConfig {
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

export interface CountHandlerOptions extends HandlerOptions<CountHandlerConfig> {
  storage: Connection;
}

@Inject('storage')
export class CountHandler extends BaseHandler<CountHandlerConfig> implements Handler {
  protected storage: Connection;
  protected counterRepository: Repository<Counter>;

  constructor(options: CountHandlerOptions) {
    super(options);

    this.storage = options.storage;
    this.counterRepository = this.storage.getRepository(Counter);
  }

  public async handle(cmd: Command): Promise<void> {
    const count = cmd.getHeadOrDefault(this.config.field.count, this.config.default.count);
    const name = cmd.getHeadOrDefault(this.config.field.name, cmd.context.threadId);

    this.logger.debug({ count, counterName: name }, 'finding counter');
    const counter = await this.findOrCreateCounter(name, cmd.context.roomId);

    switch (count) {
      case 'ls':
        const body = await this.listCounters(cmd.context.roomId);
        return this.bot.send(Message.reply(body, cmd.context));
      case '++':
        ++counter.count;
        break;
      case '--':
        --counter.count;
        break;
      default:
        counter.count += Math.max(Math.min(Number(count), this.config.range.max), this.config.range.min);
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

    return Counter.create({
      count: Number(this.config.default.count),
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
