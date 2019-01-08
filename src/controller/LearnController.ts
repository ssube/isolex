import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from 'src/BotService';
import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions, ErrorReplyType } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Keyword } from 'src/entity/misc/Keyword';
import { mustExist } from 'src/utils';
import { Checklist, ChecklistOptions } from 'src/utils/Checklist';

export const NOUN_KEYWORD = 'keyword';

export interface LearnControllerData extends ControllerData {
  field: string;
  nouns: ChecklistOptions<string>;
}

export type LearnControllerOptions = BaseControllerOptions<LearnControllerData>;

@Inject(INJECT_STORAGE)
export class LearnController extends BaseController<LearnControllerData> implements Controller {
  protected readonly checkNoun: Checklist<string>;
  protected readonly keywordRepository: Repository<Keyword>;

  constructor(options: LearnControllerOptions) {
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
    return this.reply(ctx, this.translate('create.success', {
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
    return this.reply(ctx, this.translate('delete.success', {
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

  @Handler(NOUN_KEYWORD, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}
