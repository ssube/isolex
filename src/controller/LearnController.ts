import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Keyword } from 'src/entity/misc/Keyword';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';

export const NOUN_KEYWORD = 'keyword';

export interface LearnControllerData extends ControllerData {
  field: string;
  nouns: ChecklistOptions<string>;
}

export type LearnControllerOptions = ControllerOptions<LearnControllerData>;

@Inject('storage')
export class LearnController extends BaseController<LearnControllerData> implements Controller {
  protected readonly checkNoun: Checklist<string>;
  protected readonly keywordRepository: Repository<Keyword>;
  protected readonly storage: Connection;

  constructor(options: LearnControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-learn', [NOUN_KEYWORD]);

    this.checkNoun = new Checklist(options.data.nouns);
    this.storage = options.storage;
    this.keywordRepository = this.storage.getRepository(Keyword);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createKeyword(cmd);
      case CommandVerb.Delete:
        return this.deleteKeyword(cmd);
      case CommandVerb.Update:
      default:
        return this.executeKeyword(cmd);
    }
  }

  protected async createKeyword(cmd: Command): Promise<void> {
    const body = cmd.getOrDefault('body', []);
    const key = cmd.getHead('keyword');
    const noun = cmd.getHead('future-noun');
    const verb = cmd.getHead('future-verb') as CommandVerb;

    if (!this.checkNoun.check(noun)) {
      return this.reply(cmd.context, 'invalid noun');
    }

    const keyword = new Keyword({
      controllerId: this.getId(true),
      data: { body },
      key,
      labels: {},
      noun,
      verb,
    });

    this.logger.debug({ body, cmd, key, keyword }, 'learning command');

    const existing = await this.keywordRepository.findOne({
      key,
    });
    if (existing) {
      return this.reply(cmd.context, `command already exists: ${key}`);
    }

    await this.keywordRepository.save(keyword);
    return this.reply(cmd.context, `Learned command ${key}.`);
  }

  protected async deleteKeyword(cmd: Command): Promise<void> {
    const key = cmd.getHead('keyword');

    const keyword = await this.keywordRepository.findOne({
      key,
    });
    if (!keyword) {
      return this.reply(cmd.context, `command ${key} does not exist.`);
    }

    await this.keywordRepository.delete({
      id: keyword.id,
      key,
    });
    return this.reply(cmd.context, `deleted command ${key}.`);
  }

  protected async executeKeyword(cmd: Command) {
    const body = cmd.getOrDefault('body', []);
    const key = cmd.getHead('keyword');

    const keyword = await this.keywordRepository.findOne({
      key,
    });

    if (!keyword) {
      return this.reply(cmd.context, 'missing keyword or command');
    }

    // TODO: merge with saved data before executing
    const merged = new Command({
      ...keyword,
      context: cmd.context,
      data: {
        [this.data.field]: body,
      },
    });

    this.logger.debug({ cmd, keyword, merged }, 'executing keyword command');
    await this.bot.executeCommand(merged);
    return;
  }
}
