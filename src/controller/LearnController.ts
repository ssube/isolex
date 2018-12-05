import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Keyword } from 'src/entity/misc/Keyword';
import { TYPE_TEXT } from 'src/utils/Mime';

export const NOUN_KEYWORD = 'keyword';

export interface LearnControllerData extends ControllerData {
  field: string;
  modes: {
    create: string;
    delete: string;
    execute: string;
  };
}

export interface LearnControllerOptions extends ControllerOptions<LearnControllerData> {
  storage: Connection;
}

@Inject('storage')
export class LearnController extends BaseController<LearnControllerData> implements Controller {
  protected storage: Connection;
  protected keywordRepository: Repository<Keyword>;

  constructor(options: LearnControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_KEYWORD],
    });

    this.storage = options.storage;
    this.keywordRepository = this.storage.getRepository(Keyword);
  }

  public async handle(cmd: Command): Promise<void> {
    const args: Array<string> = cmd.get('args');
    if (!args) {
      throw new Error('missing args to learn controller');
    }

    const [keyword, ...body] = args;

    this.logger.debug({ body, keyword }, 'handling learned keyword');

    const { modes } = this.data;
    switch (cmd.verb) {
      case modes.create:
        return this.createKeyword(keyword, cmd, body);
      case modes.delete:
        return this.deleteKeyword(keyword, cmd);
      case modes.execute:
      default:
        return this.executeKeyword(keyword, cmd, body);
    }
  }

  protected async createKeyword(key: string, cmd: Command, args: Array<string>): Promise<void> {
    const keyword = Keyword.create({
      command: Command.create({
        context: cmd.context,
        data: { args },
        labels: {},
        noun: cmd.noun,
        verb: cmd.verb,
      }),
      controller: this.name,
      name: key,
    });

    this.logger.debug({ args, cmd, key, keyword }, 'learning command');

    if (await this.keywordRepository.findOne(name)) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, `Command already exists: ${name}`));
    }

    await this.keywordRepository.save(keyword);

    return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, `Learned command ${name}.`));
  }

  protected async deleteKeyword(name: string, cmd: Command) {
    const keyword = await this.keywordRepository.findOne(name);

    if (!keyword) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, `Command ${name} does not exist.`));
    }

    await this.keywordRepository.delete(name);

    return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, `Deleted command ${name}.`));
  }

  protected async executeKeyword(name: string, cmd: Command, body: Array<string>) {
    const keyword = await this.keywordRepository.findOne(name, {
      relations: ['command', 'command.context'],
    });

    if (!keyword || !keyword.command) {
      throw new Error('missing keyword or command');
    }

    const [noun, ...args] = body;

    this.logger.debug({ args, noun }, 'building command');

    const emit = keyword.command.extend({
      context: cmd.context,
      data: {
        [this.data.field]: args,
      },
      noun,
    });

    this.logger.debug({ emit, keyword }, 'keywording command');

    await this.bot.handle(emit);
    return;
  }
}
