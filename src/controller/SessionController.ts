import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection } from 'typeorm';

import { UserRepository } from 'src/entity/auth/UserRepository';
import { Command, CommandVerb } from 'src/entity/Command';

import { BaseController } from './BaseController';
import { Controller, ControllerData, ControllerOptions } from './Controller';

export const NOUN_GRANT = 'grant';
export const NOUN_SESSION = 'session';

export interface SessionControllerData extends ControllerData {
  token: {
    audience: Array<string>;
    duration: number;
    issuer: string;
    secret: string;
  };
}

export type SessionControllerOptions = ControllerOptions<SessionControllerData>;

@Inject('bot', 'storage')
export class SessionController extends BaseController<SessionControllerData> implements Controller {
  protected storage: Connection;
  protected userRepository: UserRepository;

  constructor(options: SessionControllerOptions) {
    super(options, [NOUN_GRANT, NOUN_SESSION]);

    this.storage = options.storage;
    this.userRepository = this.storage.getCustomRepository(UserRepository);
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_GRANT:
        return this.handleGrant(cmd);
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
    const permissions = cmd.get('permissions');
    const results = permissions.map((p) => {
      return `${p}: \`${cmd.context.checkGrants([p])}\``;
    }).join('\n');
    return this.reply(cmd.context, results);
  }

  public async listGrants(cmd: Command): Promise<void> {
    const permissions = cmd.get('permissions');
    const results = permissions.map((p) => {
      return `${p}: \`${cmd.context.listGrants([p])}\``;
    }).join('\n');
    return this.reply(cmd.context, results);
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
    return this.reply(cmd.context, 'created session');
  }

  public async getSession(cmd: Command): Promise<void> {
    const session = cmd.context.source.getSession(cmd.context.uid);
    if (isNil(session)) {
      return this.reply(cmd.context, 'cannot get sessions unless logged in');
    }

    return this.reply(cmd.context, session.toString());
  }
}
