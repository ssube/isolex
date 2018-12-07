import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { Role } from 'src/entity/auth/Role';
import { Session } from 'src/entity/auth/Session';
import { User } from 'src/entity/auth/User';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context, ContextData } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';
import { SessionProvider } from 'src/utils/SessionProvider';

import { BaseController } from './BaseController';
import { Controller, ControllerData, ControllerOptions } from './Controller';

export const NOUN_SESSION = 'session';
export const NOUN_USER = 'user';

export type AuthControllerData = ControllerData;
export type AuthControllerOptions = ControllerOptions<AuthControllerData>;

@Inject('storage')
export class AuthController extends BaseController<AuthControllerData> implements Controller, SessionProvider {
  protected storage: Connection;
  protected roleRepository: Repository<Role>;
  protected sessionRepository: Repository<Session>;
  protected userRepository: Repository<User>;

  constructor(options: AuthControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_SESSION, NOUN_USER],
    });

    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.sessionRepository = this.storage.getRepository(Session);
    this.userRepository = this.storage.getRepository(User);
  }

  public async handle(cmd: Command): Promise<void> {
    if (cmd.noun === NOUN_SESSION) {
      return this.handleSession(cmd);
    }

    if (cmd.noun === NOUN_USER) {
      return this.handleUser(cmd);
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported noun: ${cmd.noun}`));
  }

  public async handleUser(cmd: Command): Promise<void> {
    if (cmd.verb === CommandVerb.Create) {
      return this.createUser(cmd);
    }

    if (cmd.verb === CommandVerb.Get) {
      return this.getUser(cmd);
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));
  }

  public async handleSession(cmd: Command): Promise<void> {
    if (cmd.verb === CommandVerb.Create) {
      return this.createSession(cmd);
    }

    if (cmd.verb === CommandVerb.Get) {
        return this.getSession(cmd);
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `unsupported verb: ${cmd.verb}`));

  }

  public async createUser(cmd: Command): Promise<void> {
    if (cmd.context.session) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'cannot create users while logged in'));
      return;
    }

    const name = cmd.getHeadOrDefault('name', cmd.context.userName);
    const roles = cmd.get('roles');
    const user = await this.userRepository.create({
      name,
      roles,
    });

    this.logger.debug({ user }, 'created user');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `created user: ${user.id}`));
    return;
  }

  public async createSession(cmd: Command): Promise<void> {
    if (cmd.context.session) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'cannot create sessions while logged in'));
      return;
    }

    const sessionKey = AuthController.getSessionKey(cmd.context);
    const existingSession = await this.sessionRepository.findOne(sessionKey);
    if (existingSession) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'session already exists'));
      return;
    }

    const userName = cmd.getHeadOrDefault('name', cmd.context.userName);
    const user = await this.userRepository.findOne({
      name: userName,
    });

    if (isNil(user)) {
      this.logger.warn({ sessionKey, userName }, 'user not found for new session');
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'user not found'));
      return;
    }

    this.logger.debug({ user }, 'logging in user');

    const session = await this.sessionRepository.save(new Session({
      ...AuthController.getSessionKey(cmd.context),
      user,
    }));

    this.logger.debug({ session, user, userName }, 'created session');
    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'created session'));
    return;
  }

  public async getUser(cmd: Command): Promise<void> {
    if (!cmd.context.session) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'cannot get users unless logged in'));
      return;
    }

    const session = await this.sessionRepository.findOne({
      id: cmd.context.session.id,
    });
    if (isNil(session)) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'session does not exist'));
      return;
    }

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_JSON, session.user.toString()));
    return;
  }

  public async getSession(cmd: Command): Promise<void> {
    if (!cmd.context.session) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'cannot get sessions unless logged in'));
      return;
    }

    const session = await this.sessionRepository.findOne({
      id: cmd.context.session.id,
    });
    if (isNil(session)) {
      await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, 'session does not exist'));
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

  /**
   * Attach session information to the provided context.
   */
  public async createSessionContext(data: ContextData): Promise<Context> {
    this.logger.debug({ data }, 'decorating context with session');

    const sessionKey = AuthController.getSessionKey(data);
    const session = await this.sessionRepository.findOne(sessionKey);

    if (isNil(session)) {
      this.logger.debug({ data }, 'no session for context');
      return new Context(data);
    }

    const context = new Context({
      ...data,
      session,
    });
    this.logger.debug({ context, session }, 'found session for context');

    return context;
  }

  protected static getSessionKey(ctx: ContextData) {
    return {
      listenerId: ctx.listenerId,
      userName: ctx.userId,
    };
  }
}
