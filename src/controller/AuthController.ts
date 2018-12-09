import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { Role } from 'src/entity/auth/Role';
import { Token } from 'src/entity/auth/Token';
import { User } from 'src/entity/auth/User';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';

import { BaseController } from './BaseController';
import { Controller, ControllerData, ControllerOptions } from './Controller';

export const NOUN_SESSION = 'session';
export const NOUN_USER = 'user';

export type AuthControllerData = ControllerData;
export type AuthControllerOptions = ControllerOptions<AuthControllerData>;

@Inject('bot', 'storage')
export class AuthController extends BaseController<AuthControllerData> implements Controller {
  protected storage: Connection;
  protected roleRepository: Repository<Role>;
  protected tokenRepository: Repository<Token>;
  protected userRepository: Repository<User>;

  constructor(options: AuthControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_SESSION, NOUN_USER],
    });

    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.tokenRepository = this.storage.getRepository(Token);
    this.userRepository = this.storage.getRepository(User);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_SESSION:
        return this.handleSession(cmd);
      case NOUN_USER:
        return this.handleUser(cmd);
      default:
        await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported noun: ${cmd.noun}`));
    }
  }

  public async handleUser(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createUser(cmd);
      case CommandVerb.Get:
        return this.getUser(cmd);
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

  public async createUser(cmd: Command): Promise<void> {
    const name = cmd.getHeadOrDefault('name', cmd.context.name);
    const user = await this.userRepository.save(this.userRepository.create({
      name,
      roles: [],
    }));

    this.logger.debug({ user }, 'created user');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `created user: ${user.id}`));
    return;
  }

  public async createSession(cmd: Command): Promise<void> {
    const userName = cmd.getHeadOrDefault('name', cmd.context.name);
    const user = await this.userRepository.findOne({
      name: userName,
    });

    if (isNil(user)) {
      this.logger.warn({ userName }, 'user not found for new session');
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'user not found'));
      return;
    }

    this.logger.debug({ user }, 'logging in user');
    const session = await cmd.context.source.createSession(cmd.context.uid, user);

    this.logger.debug({ session, user, userName }, 'created session');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'created session'));
    return;
  }

  public async getUser(cmd: Command): Promise<void> {
    const { token } = cmd.context;
    if (isNil(token)) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'session does not exist'));
      return;
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_JSON, token.user.name));
    return;
  }

  public async getSession(cmd: Command): Promise<void> {
    const session = cmd.context.source.getSession(cmd.context.uid);
    if (isNil(session)) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'cannot get sessions unless logged in'));
      return;
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_JSON, session.toString()));
  }

  /**
   * Check a set of shiro-style permissions
   */
  public async checkPermissions(ctx: Context, perms: Array<string>): Promise<boolean> {
    return false;
  }
}
