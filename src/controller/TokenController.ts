import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import { Equal, LessThan, Repository } from 'typeorm';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { INJECT_STORAGE } from '../BotService';
import { Token } from '../entity/auth/Token';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { Storage } from '../storage';
import { Clock } from '../utils/Clock';
import { BaseController, BaseControllerOptions } from './BaseController';
import { createCommandCompletion } from './helpers';

export const NOUN_TOKEN = 'token';

export interface TokenControllerData extends ControllerData {
  token: {
    audience: Array<string>;
    duration: number;
    issuer: string;
    secret: string;
  };
}

@Inject(INJECT_CLOCK, INJECT_STORAGE)
export class TokenController extends BaseController<TokenControllerData> implements Controller {
  protected readonly clock: Clock;
  protected readonly storage: Storage;
  protected readonly tokenRepository: Repository<Token>;

  constructor(options: BaseControllerOptions<TokenControllerData>) {
    super(options, 'isolex#/definitions/service-controller-token', [NOUN_TOKEN]);

    this.clock = mustExist(options[INJECT_CLOCK]);
    this.storage = mustExist(options[INJECT_STORAGE]);
    this.tokenRepository = this.storage.getRepository(Token);
  }

  @Handler(NOUN_TOKEN, CommandVerb.Create)
  @CheckRBAC()
  public async createToken(cmd: Command, ctx: Context): Promise<void> {
    const user = this.getUserOrFail(ctx);
    const grants = cmd.getOrDefault('grants', []);
    const now = this.clock.getSeconds();
    const token = await this.tokenRepository.save(new Token({
      audience: this.data.token.audience,
      createdAt: this.clock.getDate(now),
      data: {},
      expiresAt: this.clock.getDate(now + this.data.token.duration),
      grants,
      issuer: this.data.token.issuer,
      labels: {},
      subject: mustExist(user.id),
      user,
    }));
    const jwt = token.sign(this.data.token.secret);

    await this.reply(ctx, token.toString());
    return this.reply(ctx, jwt);
  }

  @Handler(NOUN_TOKEN, CommandVerb.Delete)
  @CheckRBAC()
  public async deleteTokens(cmd: Command, ctx: Context): Promise<void> {
    const user = this.getUserOrFail(ctx);
    const before = cmd.getHeadOrNumber('before', this.clock.getSeconds());
    if (cmd.getHeadOrDefault('confirm', 'no') !== 'yes') {
      const completion = createCommandCompletion(cmd, 'confirm', this.translate(ctx, 'delete.confirm', {
        before,
        name: user.name,
      }));
      await this.bot.executeCommand(completion);
      return;
    }

    await this.tokenRepository.delete({
      createdAt: LessThan(before),
      subject: Equal(mustExist(user.id)),
    });

    return this.reply(ctx, this.translate(ctx, 'delete.success'));
  }

  @Handler(NOUN_TOKEN, CommandVerb.Get)
  @CheckRBAC()
  public async getToken(cmd: Command, ctx: Context): Promise<void> {
    if (cmd.has('token')) {
      try {
        const data = Token.verify(cmd.getHead('token'), this.data.token.secret, {
          audience: this.data.token.audience,
          issuer: this.data.token.issuer,
        });
        return this.reply(ctx, JSON.stringify(data));
      } catch (err) {
        return this.reply(ctx, this.translate(ctx, 'get.invalid', {
          msg: err.message,
        }));
      }
    } else {
      if (doesExist(ctx.token)) {
        return this.reply(ctx, ctx.token.toString());
      } else {
        return this.reply(ctx, this.translate(ctx, 'get.missing'));
      }
    }
  }

  @Handler(NOUN_TOKEN, CommandVerb.List)
  @CheckRBAC()
  public async listTokens(cmd: Command, ctx: Context): Promise<void> {
    const user = this.getUserOrFail(ctx);
    const tokens = await this.tokenRepository.find({
      where: {
        subject: Equal(mustExist(user.id)),
      },
    });

    return this.reply(ctx, JSON.stringify(tokens));
  }

  @Handler(NOUN_TOKEN, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}
