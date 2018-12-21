import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
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

export type LearnControllerOptions = ControllerOptions<LearnControllerData>;

@Inject('storage')
export class LearnController extends BaseController<LearnControllerData> implements Controller {
  protected storage: Connection;
  protected keywordRepository: Repository<Keyword>;

  constructor(options: LearnControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-learn', [NOUN_KEYWORD]);

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
        return this.deleteKeyword(keyword, cmd.context);
      case modes.execute:
      default:
        return this.executeKeyword(keyword, cmd.context, body);
    }
  }

  protected async createKeyword(key: string, cmd: Command, args: Array<string>): Promise<void> {
    const keyword = new Keyword({
      command: new Command({
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
      return this.reply(cmd.context, `Command already exists: ${name}`);
    }

    await this.keywordRepository.save(keyword);
    return this.reply(cmd.context, `Learned command ${name}.`);
  }

  protected async deleteKeyword(name: string, context: Context): Promise<void> {
    const keyword = await this.keywordRepository.findOne(name);

    if (!keyword) {
      return this.reply(context, `Command ${name} does not exist.`);
    }

    await this.keywordRepository.delete(name);
    return this.reply(context, `Deleted command ${name}.`);
  }

  protected async executeKeyword(name: string, context: Context, body: Array<string>) {
    const keyword = await this.keywordRepository.findOne(name, {
      relations: ['command', 'command.context'],
    });

    if (!keyword || !keyword.command) {
      throw new Error('missing keyword or command');
    }

    const [noun, ...args] = body;

    this.logger.debug({ args, noun }, 'building command');

    const cmd = keyword.command.extend({
      context,
      data: {
        [this.data.field]: args,
      },
      noun,
    });

    this.logger.debug({ cmd, keyword }, 'executing keyword command');

    await this.bot.executeCommand(cmd);
    return;
  }
}
