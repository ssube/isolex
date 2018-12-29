import { Inject } from 'noicejs';
import { Connection, Equal, LessThan, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { createCompletion } from 'src/controller/CompletionController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Token } from 'src/entity/auth/Token';
import { Command, CommandVerb } from 'src/entity/Command';
import { Clock } from 'src/utils/Clock';

const MSG_SESSION_REQUIRED = 'must be logged in';
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

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_TOKEN:
        return this.handleToken(cmd);
      default:
        return this.reply(cmd.context, `unsupported noun: ${cmd.noun}`);
    }
  }

  public async handleToken(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createToken(cmd);
      case CommandVerb.Delete:
        return this.deleteTokens(cmd);
      case CommandVerb.Get:
        return this.getToken(cmd);
      case CommandVerb.List:
        return this.listTokens(cmd);
      default:
        return this.reply(cmd.context, `unsupported verb: ${cmd.verb}`);
    }
  }

  public async createToken(cmd: Command): Promise<void> {
    if (!cmd.context.user) {
      return this.reply(cmd.context, MSG_SESSION_REQUIRED);
    }

    const grants = cmd.getOrDefault('grants', []);
    const now = this.clock.getSeconds();
    const token = await this.tokenRepository.save(new Token({
      audience: this.data.token.audience,
      createdAt: now,
      data: {},
      expiresAt: now + this.data.token.duration,
      grants,
      issuer: this.data.token.issuer,
      labels: {},
      subject: cmd.context.user.id,
      user: cmd.context.user,
    }));
    const jwt = token.sign(this.data.token.secret);

    await this.reply(cmd.context, token.toString());
    return this.reply(cmd.context, jwt);
  }

  public async deleteTokens(cmd: Command): Promise<void> {
    if (!cmd.context.user) {
      return this.reply(cmd.context, MSG_SESSION_REQUIRED);
    }

    const before = cmd.getHeadOrNumber('before', this.clock.getSeconds());
    if (cmd.getHeadOrDefault('confirm', 'no') !== 'yes') {
      const completion = createCompletion(cmd, 'confirm', `please confirm deleting tokens for ${cmd.context.user.name} from before ${before}`);
      await this.bot.executeCommand(completion);
      return;
    }

    const results = await this.tokenRepository.delete({
      createdAt: LessThan(before),
      subject: Equal(cmd.context.user.id),
    });

    if (results.affected) {
      return this.reply(cmd.context, `deleted ${results.affected} tokens`);
    } else {
      return this.reply(cmd.context, `tokens deleted`);
    }
  }

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

  public async listTokens(cmd: Command): Promise<void> {
    if (!cmd.context.user) {
      return this.reply(cmd.context, MSG_SESSION_REQUIRED);
    }

    const tokens = await this.tokenRepository.find({
      where: {
        subject: Equal(cmd.context.user.id),
      },
    });

    return this.reply(cmd.context, JSON.stringify(tokens));
  }
}
