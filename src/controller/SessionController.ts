import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, In, Repository } from 'typeorm';

import { BaseController } from 'src/controller/BaseController';
import { createCompletion } from 'src/controller/CompletionController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Role } from 'src/entity/auth/Role';
import { Token } from 'src/entity/auth/Token';
import { User } from 'src/entity/auth/User';
import { UserRepository } from 'src/entity/auth/UserRepository';
import { Command, CommandVerb } from 'src/entity/Command';
import { Clock } from 'src/utils/Clock';

export const NOUN_GRANT = 'grant';
export const NOUN_JOIN = 'join';
export const NOUN_SESSION = 'session';

export interface SessionControllerData extends ControllerData {
  join: {
    grants: Array<string>;
    roles: Array<string>;
  };
  token: {
    audience: Array<string>;
    duration: number;
    issuer: string;
    secret: string;
  };
}

export type SessionControllerOptions = ControllerOptions<SessionControllerData>;

@Inject('clock', 'storage')
export class SessionController extends BaseController<SessionControllerData> implements Controller {
  protected clock: Clock;
  protected storage: Connection;
  protected roleRepository: Repository<Role>;
  protected tokenRepository: Repository<Token>;
  protected userRepository: UserRepository;

  constructor(options: SessionControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-session', [NOUN_GRANT, NOUN_JOIN, NOUN_SESSION]);

    this.clock = options.clock;
    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.tokenRepository = this.storage.getRepository(Token);
    this.userRepository = this.storage.getCustomRepository(UserRepository);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_GRANT:
        return this.handleGrant(cmd);
      case NOUN_JOIN:
        return this.handleJoin(cmd);
      case NOUN_SESSION:
        return this.handleSession(cmd);
      default:
        return this.reply(cmd.context, `unsupported noun: ${cmd.noun}`);
    }
  }

  public async handleGrant(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Get:
        return this.getGrant(cmd);
      case CommandVerb.List:
        return this.listGrants(cmd);
      default:
        return this.reply(cmd.context, `unsupported verb: ${cmd.verb}`);
    }
  }

  public async handleJoin(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createJoin(cmd);
      case CommandVerb.Delete:
        return this.deleteJoin(cmd);
      default:
        return this.reply(cmd.context, `unsupported verb: ${cmd.verb}`);
    }
  }

  public async handleSession(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createSession(cmd);
      case CommandVerb.Get:
        return this.getSession(cmd);
      default:
        return this.reply(cmd.context, `unsupported verb: ${cmd.verb}`);
    }
  }

  public async getGrant(cmd: Command): Promise<void> {
    const grants = cmd.get('grants');
    const results = grants.map((p) => {
      return `${p}: \`${cmd.context.checkGrants([p])}\``;
    }).join('\n');
    return this.reply(cmd.context, results);
  }

  public async listGrants(cmd: Command): Promise<void> {
    const grants = cmd.get('grants');
    const results = grants.map((p) => {
      return `${p}: \`${cmd.context.listGrants([p])}\``;
    }).join('\n');
    return this.reply(cmd.context, results);
  }

  /**
   * join is a slightly unusual noun that creates a user with a default role, then creates a token for that user
   */
  public async createJoin(cmd: Command): Promise<void> {
    const name = cmd.getHeadOrDefault('name', cmd.context.name);

    if (await this.userRepository.count({
      name,
    })) {
      return this.reply(cmd.context, `user ${name} already exists`);
    }

    const roles = await this.roleRepository.find({
      where: {
        name: In(this.data.join.roles),
      },
    });
    const user = await this.userRepository.save(new User({
      name,
      roles,
    }));

    const jwt = await this.createToken(user);
    return this.reply(cmd.context, `user ${name} joined, sign in token: ${jwt}`);
  }

  public async deleteJoin(cmd: Command): Promise<void> {
    if (!cmd.context.user) {
      return this.reply(cmd.context, 'must be logged in');
    }

    if (cmd.getHeadOrDefault('confirm', 'no') !== 'yes') {
      const completion = createCompletion(cmd, 'confirm', `please confirm deleting all tokens for ${cmd.context.user.name}`);
      await this.bot.executeCommand(completion);
      return;
    }

    await this.tokenRepository.delete({
      subject: cmd.context.user.id,
    });

    const jwt = await this.createToken(cmd.context.user);
    return this.reply(cmd.context, `revoked tokens for ${cmd.context.user.name}, new sign in token: ${jwt}`);
  }

  public async createSession(cmd: Command): Promise<void> {
    if (!cmd.context.source) {
      return this.reply(cmd.context, 'no source listener with which to create a session');
    }

    try {
      const jwt = cmd.getHead('token');
      const token = Token.verify(jwt, this.data.token.secret, {
        audience: this.data.token.audience,
        issuer: this.data.token.issuer,
      });
      this.logger.debug({ token }, 'creating session from token');

      const user = await this.userRepository.findOneOrFail({
        id: token.sub,
      });
      await this.userRepository.loadRoles(user);
      this.logger.debug({ user }, 'logging in user');

      const session = await cmd.context.source.createSession(cmd.context.uid, user);
      this.logger.debug({ session, user }, 'created session');
      return this.reply(cmd.context, 'created session');
    } catch (err) {
      this.logger.error(err, 'error creating session');
      return this.reply(cmd.context, err.message);
    }
  }

  public async getSession(cmd: Command): Promise<void> {
    if (!cmd.context.source) {
      return this.reply(cmd.context, 'no source listener with which to create a session');
    }

    const session = cmd.context.source.getSession(cmd.context.uid);
    if (isNil(session)) {
      return this.reply(cmd.context, 'cannot get sessions unless logged in');
    }

    return this.reply(cmd.context, session.toString());
  }

  protected async createToken(user: User): Promise<string> {
    const issued = this.clock.getSeconds();
    const expires = issued + this.data.token.duration;
    this.logger.debug({ expires, issued }, 'creating token');

    const tokenPre = new Token({
      audience: this.data.token.audience,
      createdAt: this.clock.getDate(issued),
      data: {},
      expiresAt: this.clock.getDate(expires),
      grants: this.data.join.grants,
      issuer: this.data.token.issuer,
      labels: {},
      subject: user.id,
      user,
    });

    const token = await this.tokenRepository.save(tokenPre);
    this.logger.debug({ expires, issued, token }, 'signing token');
    return token.sign(this.data.token.secret);
  }
}
