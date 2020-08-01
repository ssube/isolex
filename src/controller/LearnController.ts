import { Checklist, ChecklistOptions, isNil, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { INJECT_STORAGE } from '../BotService';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { Keyword } from '../entity/misc/Keyword';
import { BaseController, BaseControllerOptions, ErrorReplyType } from './BaseController';

export const NOUN_KEYWORD = 'keyword';

export interface LearnControllerData extends ControllerData {
  field: string;
  nouns: ChecklistOptions<string>;
}

@Inject(INJECT_STORAGE)
export class LearnController extends BaseController<LearnControllerData> implements Controller {
  protected readonly checkNoun: Checklist<string>;
  protected readonly keywordRepository: Repository<Keyword>;

  constructor(options: BaseControllerOptions<LearnControllerData>) {
    super(options, 'isolex#/definitions/service-controller-learn', [NOUN_KEYWORD]);

    this.checkNoun = new Checklist(options.data.nouns);
    this.keywordRepository = mustExist(options[INJECT_STORAGE]).getRepository(Keyword);
  }

  @Handler(NOUN_KEYWORD, CommandVerb.Create)
  @CheckRBAC()
  public async createKeyword(cmd: Command, ctx: Context): Promise<void> {
    const body = cmd.getOrDefault('body', []);
    const key = cmd.getHead('keyword');
    const noun = cmd.getHead('future-noun');
    const verb = cmd.getHead('future-verb') as CommandVerb;

    if (!this.checkNoun.check(noun)) {
      return this.errorReply(ctx, ErrorReplyType.InvalidNoun);
    }

    const keyword = new Keyword({
      controllerId: this.getId(true),
      data: { body },
      key,
      labels: cmd.labels,
      noun,
      verb,
    });

    this.logger.debug({ body, cmd, key, keyword }, 'learning command');

    const existing = await this.keywordRepository.count({ key });
    if (existing > 0) {
      return this.errorReply(ctx, ErrorReplyType.EntityExists, key);
    }

    await this.keywordRepository.save(keyword);
    return this.reply(ctx, this.translate(ctx, 'create.success', {
      key,
    }));
  }

  @Handler(NOUN_KEYWORD, CommandVerb.Delete)
  @CheckRBAC()
  public async deleteKeyword(cmd: Command, ctx: Context): Promise<void> {
    const key = cmd.getHead('keyword');

    const keyword = await this.keywordRepository.findOne({
      key,
    });
    if (isNil(keyword)) {
      return this.errorReply(ctx, ErrorReplyType.EntityMissing, key);
    }

    await this.keywordRepository.delete({
      id: keyword.id,
      key,
    });
    return this.reply(ctx, this.translate(ctx, 'delete.success', {
      key,
    }));
  }

  @Handler(NOUN_KEYWORD, CommandVerb.Update)
  @CheckRBAC()
  public async executeKeyword(cmd: Command, ctx: Context): Promise<void> {
    const body = cmd.getOrDefault('body', []);
    const key = cmd.getHead('keyword');

    const keyword = await this.keywordRepository.findOne({
      key,
    });

    if (isNil(keyword)) {
      return this.errorReply(ctx, ErrorReplyType.EntityMissing, key);
    }

    const merged = new Command({
      ...keyword,
      context: cmd.context,
      data: new Map([
        ...keyword.data,
        [this.data.field, body],
      ]),
    });

    this.logger.debug({ cmd, keyword, merged }, 'executing keyword command');
    await this.bot.executeCommand(merged);
  }

  @Handler(NOUN_KEYWORD, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}
