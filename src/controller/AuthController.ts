import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, In, Repository } from 'typeorm';

import { Role } from 'src/entity/auth/Role';
import { Token } from 'src/entity/auth/Token';
import { User } from 'src/entity/auth/User';
import { UserRepository } from 'src/entity/auth/UserRepository';
import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';

import { BaseController } from './BaseController';
import { Controller, ControllerData, ControllerOptions } from './Controller';

export const NOUN_PERMISSION = 'permission';
export const NOUN_ROLE = 'role';
export const NOUN_SESSION = 'session';
export const NOUN_TOKEN = 'token';
export const NOUN_USER = 'user';

export interface AuthControllerData extends ControllerData {
  token: {
    audience: Array<string>;
    duration: number;
    issuer: string;
    secret: string;
  };
}

export type AuthControllerOptions = ControllerOptions<AuthControllerData>;

@Inject('bot', 'storage')
export class AuthController extends BaseController<AuthControllerData> implements Controller {
  protected storage: Connection;
  protected roleRepository: Repository<Role>;
  protected tokenRepository: Repository<Token>;
  protected userRepository: UserRepository;

  constructor(options: AuthControllerOptions) {
    super(options, [NOUN_PERMISSION, NOUN_ROLE, NOUN_SESSION, NOUN_TOKEN, NOUN_USER]);

    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.tokenRepository = this.storage.getRepository(Token);
    this.userRepository = this.storage.getCustomRepository(UserRepository);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_PERMISSION:
        return this.handlePermission(cmd);
      case NOUN_ROLE:
        return this.handleRole(cmd);
      case NOUN_SESSION:
        return this.handleSession(cmd);
      case NOUN_TOKEN:
        return this.handleToken(cmd);
      case NOUN_USER:
        return this.handleUser(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported noun: ${cmd.noun}`));
    }
  }

  public async handlePermission(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Get:
        return this.getPermission(cmd);
      case CommandVerb.List:
        return this.listPermissions(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));
    }
  }

  public async handleRole(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createRole(cmd);
      case CommandVerb.Get:
        return this.getRole(cmd);
      case CommandVerb.List:
        return this.listRoles(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));
    }
  }

  public async handleSession(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createSession(cmd);
      case CommandVerb.Get:
        return this.getSession(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));
    }
  }

  public async handleToken(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createToken(cmd);
      case CommandVerb.Get:
        return this.getToken(cmd);
      case CommandVerb.List:
        return this.listTokens(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));
    }
  }

  public async handleUser(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createUser(cmd);
      case CommandVerb.Get:
        return this.getUser(cmd);
      case CommandVerb.Update:
        return this.updateUser(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));
    }
  }

  public async getPermission(cmd: Command): Promise<void> {
    const permissions = cmd.get('permissions');
    const results = permissions.map((p) => {
      return `${p}: \`${cmd.context.checkGrants([p])}\``;
    }).join('\n');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, results));
  }

  public async listPermissions(cmd: Command): Promise<void> {
    const permissions = cmd.get('permissions');
    const results = permissions.map((p) => {
      return `${p}: \`${cmd.context.listGrants([p])}\``;
    }).join('\n');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, results));
  }

  public async createRole(cmd: Command): Promise<void> {
    const name = cmd.getHead('name');
    const grants = cmd.get('grants');
    const role = await this.roleRepository.insert({
      grants,
      name,
    });
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(role)));
  }

  public async getRole(cmd: Command): Promise<void> {
    const name = cmd.get('name');
    const role = await this.roleRepository.findOne({
      where: {
        name,
      },
    });
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(role)));
  }

  public async listRoles(cmd: Command): Promise<void> {
    const roles = await this.roleRepository.createQueryBuilder('role').getMany();
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(roles)));
  }

  public async createToken(cmd: Command): Promise<void> {
    if (!cmd.context.user) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'must be logged in'));
      return;
    }

    const grants = cmd.getOrDefault('grants', []);
    const now = Math.floor(Date.now() / 1000);
    const token = await this.tokenRepository.save(new Token({
      audience: this.data.token.audience,
      createdAt: now,
      data: {},
      expiresAt: now + this.data.token.duration,
      grants,
      issuer: this.data.token.issuer,
      labels: {},
      subject: cmd.context.uid,
      user: cmd.context.user,
    }));
    const jwt = token.sign(this.data.token.secret);

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(token)));
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, jwt));
  }

  public async getToken(cmd: Command): Promise<void> {
    if (cmd.has('token')) {
      try {
        const data = Token.verify(cmd.getHead('token'), this.data.token.secret, {
          audience: this.data.token.audience,
          issuer: this.data.token.issuer,
        });
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(data)));
      } catch (err) {
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `error verifying token: ${err.message}`));
      }
    } else {
      if (!cmd.context.token) {
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'must provide token'));
        return;
      }

      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(cmd.context.token)));
    }
  }

  public async listTokens(cmd: Command): Promise<void> {
    if (!cmd.context.user) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'must be logged in'));
      return;
    }

    const tokens = this.tokenRepository.find({
      where: {
        user: cmd.context.user,
      },
    });

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(tokens)));
  }

  public async createUser(cmd: Command): Promise<void> {
    const name = cmd.getHeadOrDefault('name', cmd.context.name);
    const roleNames = cmd.getOrDefault('roles', []);
    this.logger.debug({ name, roles: roleNames }, 'creating user');

    const roles = await this.roleRepository.find({
      where: {
        name: In(roleNames),
      },
    });
    this.logger.debug({ roles }, 'found roles');

    const user = await this.userRepository.save(new User({
      name,
      roles,
    }));
    this.logger.debug({ user }, 'created user');

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `created user: ${user.id}`));
  }

  public async getUser(cmd: Command): Promise<void> {
    const name = cmd.getHead('name');
    const user = await this.userRepository.findOneOrFail({
      where: {
        name,
      },
    });
    await this.userRepository.loadRoles(user);
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_JSON, JSON.stringify(user)));
  }

  public async updateUser(cmd: Command): Promise<void> {
    const name = cmd.getHeadOrDefault('name', cmd.context.name);
    const roleNames = cmd.getOrDefault('roles', []);
    this.logger.debug({ name, roles: roleNames }, 'updating user');
    const user = await this.userRepository.findOneOrFail({
      where: {
        name,
      },
    });
    const roles = await this.roleRepository.find({
      where: {
        name: In(roleNames),
      },
    });
    user.roles = roles;
    const updatedUser = await this.userRepository.save(user);
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, JSON.stringify(updatedUser)));
  }

  public async createSession(cmd: Command): Promise<void> {
    const name = cmd.getHeadOrDefault('name', cmd.context.name);
    const user = await this.userRepository.findOneOrFail({
      name,
    });
    await this.userRepository.loadRoles(user);
    this.logger.debug({ user }, 'logging in user');

    const session = await cmd.context.source.createSession(cmd.context.uid, user);
    this.logger.debug({ session, user, userName: name }, 'created session');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'created session'));
  }

  public async getSession(cmd: Command): Promise<void> {
    const session = cmd.context.source.getSession(cmd.context.uid);
    if (isNil(session)) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'cannot get sessions unless logged in'));
      return;
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_JSON, session.toString()));
  }
}
