import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, In, Repository } from 'typeorm';

import { BaseController, ErrorReplyType } from 'src/controller/BaseController';
import { createCompletion } from 'src/controller/CompletionController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Role } from 'src/entity/auth/Role';
import { Token } from 'src/entity/auth/Token';
import { User } from 'src/entity/auth/User';
import { UserRepository } from 'src/entity/auth/UserRepository';
import { Command, CommandVerb } from 'src/entity/Command';
import { Clock } from 'src/utils/Clock';

export const NOUN_GRANT = 'grant';
export const NOUN_ACCOUNT = 'account';
export const NOUN_SESSION = 'session';

export interface AccountControllerData extends ControllerData {
  join: {
    allow: boolean;
    grants: Array<string>;
    roles: Array<string>;
  };
  root: {
    allow: boolean;
    name: string;
    roles: Array<string>;
  };
  token: {
    audience: Array<string>;
    duration: number;
    issuer: string;
    secret: string;
  };
}

export type AccountControllerOptions = ControllerOptions<AccountControllerData>;

@Inject('clock', 'storage')
export class AccountController extends BaseController<AccountControllerData> implements Controller {
  protected clock: Clock;
  protected storage: Connection;
  protected roleRepository: Repository<Role>;
  protected tokenRepository: Repository<Token>;
  protected userRepository: UserRepository;

  constructor(options: AccountControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-account', [NOUN_GRANT, NOUN_ACCOUNT, NOUN_SESSION]);

    this.clock = options.clock;
    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.tokenRepository = this.storage.getRepository(Token);
    this.userRepository = this.storage.getCustomRepository(UserRepository);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_ACCOUNT:
        return this.handleAccount(cmd);
      case NOUN_GRANT:
        return this.handleGrant(cmd);
      case NOUN_SESSION:
        return this.handleSession(cmd);
      default:
        return this.reply(cmd.context, `unsupported noun: ${cmd.noun}`);
    }
  }

  public async handleAccount(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createAccount(cmd);
      case CommandVerb.Delete:
        return this.deleteAccount(cmd);
      default:
        return this.reply(cmd.context, `unsupported verb: ${cmd.verb}`);
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
    if (!this.checkGrants(cmd.context, 'grant:get')) {
      return this.errorReply(cmd.context, ErrorReplyType.GrantMissing);
    }

    const grants = cmd.get('grants');
    const results = grants.map((p) => {
      return `\`${p}: ${cmd.context.checkGrants([p])}\``;
    }).join('\n');
    return this.reply(cmd.context, results);
  }

  public async listGrants(cmd: Command): Promise<void> {
    if (!this.checkGrants(cmd.context, 'grant:list')) {
      return this.errorReply(cmd.context, ErrorReplyType.GrantMissing);
    }

    const grants = cmd.get('grants');
    const results = grants.map((p) => {
      return `\`${p}: ${cmd.context.listGrants([p])}\``;
    }).join('\n');
    return this.reply(cmd.context, results);
  }

  public async createAccount(cmd: Command): Promise<void> {
    if (!this.checkGrants(cmd.context, 'account:create') && !this.data.join.allow) {
      return this.errorReply(cmd.context, ErrorReplyType.GrantMissing);
    }

    const name = cmd.getHeadOrDefault('name', cmd.context.name);

    if (await this.userRepository.count({
      name,
    })) {
      return this.reply(cmd.context, `user ${name} already exists`);
    }

    const roleNames = this.getUserRoles(name);
    const roles = await this.roleRepository.find({
      where: {
        name: In(roleNames),
      },
    });
    const user = await this.userRepository.save(new User({
      name,
      roles,
    }));

    const jwt = await this.createToken(user);
    return this.reply(cmd.context, `user ${name} joined, sign in token: ${jwt}`);
  }

  public async deleteAccount(cmd: Command): Promise<void> {
    if (isNil(cmd.context.user)) {
      return this.errorReply(cmd.context, ErrorReplyType.SessionMissing);
    }

    if (!this.checkGrants(cmd.context, 'account:delete')) {
      return this.errorReply(cmd.context, ErrorReplyType.GrantMissing);
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
    if (isNil(cmd.context.source)) {
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
    if (isNil(cmd.context.source)) {
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

  protected getUserRoles(name: string): Array<string> {
    const roles = Array.from(this.data.join.roles);
    if (this.data.root.allow && name === this.data.root.name) {
      roles.push(...this.data.root.roles);
      this.logger.warn({ roles, user: name }, 'granting root roles to user');
    }
    return roles;
  }
}
