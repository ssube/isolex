import { Inject } from 'noicejs';
import { Connection, Equal, LessThan, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { createCompletion } from 'src/controller/CompletionController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Token } from 'src/entity/auth/Token';
import { Command, CommandVerb } from 'src/entity/Command';
import { Clock } from 'src/utils/Clock';

import { CheckRBAC, HandleNoun, HandleVerb } from '.';

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

@Inject('clock', 'storage')
export class TokenController extends BaseController<TokenControllerData> implements Controller {
  protected readonly clock: Clock;
  protected readonly storage: Connection;
  protected readonly tokenRepository: Repository<Token>;

  constructor(options: TokenControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-token', [NOUN_TOKEN]);

    this.clock = options.clock;
    this.storage = options.storage;
    this.tokenRepository = this.storage.getRepository(Token);
  }

  @HandleNoun(NOUN_TOKEN)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
  public async createToken(cmd: Command): Promise<void> {
    const user = this.getUserOrFail(cmd.context);
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
      subject: user.id,
      user,
    }));
    const jwt = token.sign(this.data.token.secret);

    await this.reply(cmd.context, token.toString());
    return this.reply(cmd.context, jwt);
  }

  @HandleNoun(NOUN_TOKEN)
  @HandleVerb(CommandVerb.Delete)
  @CheckRBAC()
  public async deleteTokens(cmd: Command): Promise<void> {
    const user = this.getUserOrFail(cmd.context);
    const before = cmd.getHeadOrNumber('before', this.clock.getSeconds());
    if (cmd.getHeadOrDefault('confirm', 'no') !== 'yes') {
      const completion = createCompletion(cmd, 'confirm', `please confirm deleting tokens for ${user.name} from before ${before}`);
      await this.bot.executeCommand(completion);
      return;
    }

    const results = await this.tokenRepository.delete({
      createdAt: LessThan(before),
      subject: Equal(user.id),
    });

    if (results.affected) {
      return this.reply(cmd.context, `deleted ${results.affected} tokens`);
    } else {
      return this.reply(cmd.context, `tokens deleted`);
    }
  }

  @HandleNoun(NOUN_TOKEN)
  @HandleVerb(CommandVerb.Get)
  @CheckRBAC()
  public async getToken(cmd: Command): Promise<void> {
    if (cmd.has('token')) {
      try {
        const data = Token.verify(cmd.getHead('token'), this.data.token.secret, {
          audience: this.data.token.audience,
          issuer: this.data.token.issuer,
        });
        return this.reply(cmd.context, JSON.stringify(data));
      } catch (err) {
        return this.reply(cmd.context, `error verifying token: ${err.message}`);
      }
    } else {
      if (!cmd.context.token) {
        return this.reply(cmd.context, 'session must be provided by a token');
      } else {
        return this.reply(cmd.context, cmd.context.token.toString());
      }
    }
  }

  @HandleNoun(NOUN_TOKEN)
  @HandleVerb(CommandVerb.List)
  @CheckRBAC()
  public async listTokens(cmd: Command): Promise<void> {
    const user = this.getUserOrFail(cmd.context);
    const tokens = await this.tokenRepository.find({
      where: {
        subject: Equal(user.id),
      },
    });

    return this.reply(cmd.context, JSON.stringify(tokens));
  }
}
