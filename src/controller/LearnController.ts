import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController, ErrorReplyType } from 'src/controller/BaseController';
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

  @HandleNoun(NOUN_KEYWORD)
  @HandleVerb(CommandVerb.Create)
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
      labels: {},
      noun,
      verb,
    });

    this.logger.debug({ body, cmd, key, keyword }, 'learning command');

    const existing = await this.keywordRepository.findOne({
      key,
    });
    if (existing) {
      return this.errorReply(ctx, ErrorReplyType.EntityExists, key);
    }

    await this.keywordRepository.save(keyword);
    return this.reply(ctx, `Learned command ${key}.`);
  }

  @HandleNoun(NOUN_KEYWORD)
  @HandleVerb(CommandVerb.Update)
  @CheckRBAC()
  public async deleteKeyword(cmd: Command, ctx: Context): Promise<void> {
    if (!this.checkGrants(ctx, `${NOUN_KEYWORD}:${CommandVerb.Delete}`)) {
      return this.errorReply(ctx, ErrorReplyType.GrantMissing);
    }

    const key = cmd.getHead('keyword');

    const keyword = await this.keywordRepository.findOne({
      key,
    });
    if (!keyword) {
      return this.errorReply(ctx, ErrorReplyType.EntityMissing, key);
    }

    await this.keywordRepository.delete({
      id: keyword.id,
      key,
    });
    return this.reply(ctx, `deleted command ${key}.`);
  }

  @HandleNoun(NOUN_KEYWORD)
  @HandleVerb(CommandVerb.Update)
  @CheckRBAC()
  public async executeKeyword(cmd: Command, ctx: Context): Promise<void> {
    if (!this.checkGrants(ctx, `${NOUN_KEYWORD}:${CommandVerb.Update}`)) {
      return this.errorReply(ctx, ErrorReplyType.GrantMissing);
    }

    const body = cmd.getOrDefault('body', []);
    const key = cmd.getHead('keyword');

    const keyword = await this.keywordRepository.findOne({
      key,
    });

    if (!keyword) {
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
}
