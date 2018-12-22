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

@Inject('bot', 'storage')
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
    const args: Array<string> = cmd.get('args');
    if (!args) {
      return this.reply(cmd.context, 'missing args to learn controller');
    }

    const [keyword, ...body] = args;

    this.logger.debug({ body, keyword }, 'handling learned keyword');

    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createKeyword(keyword, cmd, body);
      case CommandVerb.Delete:
        return this.deleteKeyword(keyword, cmd.context);
      case CommandVerb.Update:
      default:
        return this.executeKeyword(keyword, cmd.context, body);
    }
  }

  protected async createKeyword(keyName: string, cmd: Command, args: Array<string>): Promise<void> {
    const noun = cmd.getHead('noun');
    const verb = cmd.getHead('verb') as CommandVerb;

    if (!this.checkNoun.check(noun)) {
      return this.reply(cmd.context, 'invalid noun');
    }

    const keyword = new Keyword({
      command: new Command({
        context: cmd.context,
        data: { args },
        labels: {},
        noun,
        verb,
      }),
      controller: this.name,
      name: keyName,
    });

    this.logger.debug({ args, cmd, keyName, keyword }, 'learning command');

    if (await this.keywordRepository.findOne(keyName)) {
      return this.reply(cmd.context, `command already exists: ${keyName}`);
    }

    await this.keywordRepository.save(keyword);
    return this.reply(cmd.context, `Learned command ${keyName}.`);
  }

  protected async deleteKeyword(keyName: string, context: Context): Promise<void> {
    const keyword = await this.keywordRepository.findOne(keyName);
    if (!keyword) {
      return this.reply(context, `command ${keyName} does not exist.`);
    }

    await this.keywordRepository.delete(keyName);
    return this.reply(context, `deleted command ${keyName}.`);
  }

  protected async executeKeyword(keyName: string, context: Context, body: Array<string>) {
    const keyword = await this.keywordRepository.findOne(keyName, {
      relations: ['command', 'command.context'],
    });

    if (!keyword || !keyword.command) {
      return this.reply(context, 'missing keyword or command');
    }

    const cmd = keyword.command.extend({
      context,
      data: {
        [this.data.field]: body,
      },
    });

    this.logger.debug({ cmd, keyword }, 'executing keyword command');
    await this.bot.executeCommand(cmd);
    return;
  }
}
