import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Equal, LessThan, Repository } from 'typeorm';

import { INJECT_CLOCK } from 'src/BaseService';
import { INJECT_STORAGE } from 'src/BotService';
import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { createCompletion } from 'src/controller/helpers';
import { Token } from 'src/entity/auth/Token';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { mustExist } from 'src/utils';
import { Clock } from 'src/utils/Clock';

export const NOUN_TOKEN = 'token';

export interface TokenControllerData extends ControllerData {
  token: {
    audience: Array<string>;
    duration: number;
    issuer: string;
    secret: string;
  };
}

export type TokenControllerOptions = ControllerOptions<TokenControllerData>;

@Inject(INJECT_CLOCK, INJECT_STORAGE)
export class TokenController extends BaseController<TokenControllerData> implements Controller {
  protected readonly clock: Clock;
  protected readonly storage: Connection;
  protected readonly tokenRepository: Repository<Token>;

  constructor(options: TokenControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-token', [NOUN_TOKEN]);

    this.clock = options[INJECT_CLOCK];
    this.storage = options[INJECT_STORAGE];
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
      const completion = createCompletion(cmd, 'confirm', this.locale.translate('service.controller.token.delete.confirm', {
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

    return this.reply(ctx, `tokens deleted`);
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
        return this.reply(ctx, this.locale.translate('service.controller.token.get.invalid', {
          msg: err.message,
        }));
      }
    } else {
      if (isNil(ctx.token)) {
        return this.reply(ctx, this.locale.translate('service.controller.token.get.missing'));
      } else {
        return this.reply(ctx, ctx.token.toString());
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
}
