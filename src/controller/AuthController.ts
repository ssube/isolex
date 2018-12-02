import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { Role } from 'src/entity/auth/Role';
import { Session } from 'src/entity/auth/Session';
import { User } from 'src/entity/auth/User';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { TYPE_JSON, TYPE_TEXT } from 'src/utils/Mime';

import { BaseController } from './BaseController';
import { Controller, ControllerData, ControllerOptions } from './Controller';

export const NOUN_SESSION = 'session';
export const NOUN_USER = 'user';

export interface AuthControllerData extends ControllerData {

}

export interface AuthControllerOptions extends ControllerOptions<AuthControllerData> {
  storage: Connection;
}

@Inject('storage')
export class AuthController extends BaseController<AuthControllerData> implements Controller {
  protected sessions: Map<string, Session>;
  protected storage: Connection;
  protected roleRepository: Repository<Role>;
  protected sessionRepository: Repository<Session>;
  protected userRepository: Repository<User>;

  constructor(options: AuthControllerOptions) {
    super({
      ...options,
      nouns: [NOUN_SESSION, NOUN_USER],
    });

    this.sessions = new Map();
    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.sessionRepository = this.storage.getRepository(Session);
    this.userRepository = this.storage.getRepository(User);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case 'session':
        return this.handleSession(cmd);
      case 'user':
        return this.handleUser(cmd);
    }
  }

  public async handleUser(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createUser(cmd);
      case CommandVerb.Get:
        return this.getUser(cmd);
    }
  }

  public async handleSession(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createSession(cmd);
      case CommandVerb.Get:
        return this.getSession(cmd);
    }
  }

  public async createUser(cmd: Command): Promise<void> {
    if (cmd.context.session) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'cannot create users while logged in'));
    }

    const name = cmd.getHeadOrDefault('name', cmd.context.userName);
    const roles = cmd.get('roles');
    const user = await this.userRepository.create({
      name,
      roles,
    });

    return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, `created user: ${user.id}`));
  }

  public async createSession(cmd: Command): Promise<void> {
    if (cmd.context.session) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'cannot create sessions while logged in'));
    }

    const sessionKey = AuthController.getSessionKey(cmd.context);
    if (this.sessions.has(sessionKey)) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'session already exists'));
    }

    const userName = cmd.getHeadOrDefault('name', cmd.context.userName);
    const user = await this.userRepository.findOne({
      name: userName,
    });
    
    if (isNil(user)) {
      this.logger.warn({ name, sessionKey }, 'user not found for new session');
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'user not found'));
    }

    const session = await this.sessionRepository.create({
      listenerId: cmd.context.listenerId,
      user,
      userName,
    })

    this.logger.debug({ id: session.id, key: sessionKey, user, userName }, 'creating session');
    this.sessions.set(sessionKey, session);
  }

  public async getUser(cmd: Command): Promise<void> {
    if (!cmd.context.session) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'cannot get users unless logged in'));
    }

    const user = this.sessions.get(cmd.context.session.id);
    if (isNil(user)) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'session does not exist'));
    }

    return this.bot.send(Message.reply(cmd.context, TYPE_JSON, JSON.stringify(user)));
  }

  public async getSession(cmd: Command): Promise<void> {
    if (!cmd.context.session) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'cannot get sessions unless logged in'));
    }

    const user = this.sessions.get(cmd.context.session.id);
    if (isNil(user)) {
      return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, 'session does not exist'));
    }

    return this.bot.send(Message.reply(cmd.context, TYPE_JSON, JSON.stringify(user)));
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
  public async createSessionContext(ctx: Context): Promise<Context> {
    const sessionKey = AuthController.getSessionKey(ctx);
    const session = this.sessions.get(sessionKey);
    if (isNil(session)) {
      return ctx;
    }

    return ctx.extend({
      session,
    });
  }

  protected static getSessionKey(ctx: Context): string {
    return `${ctx.listenerId}:${ctx.userId}`;
  }
}
