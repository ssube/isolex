import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, In, Repository } from 'typeorm';

import { INJECT_STORAGE } from 'src/BotService';
import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Role } from 'src/entity/auth/Role';
import { User } from 'src/entity/auth/User';
import { UserRepository } from 'src/entity/auth/UserRepository';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { mustExist } from 'src/utils';

export const NOUN_ROLE = 'role';
export const NOUN_USER = 'user';

export type UserControllerData = ControllerData;
export type UserControllerOptions = ControllerOptions<UserControllerData>;

@Inject(INJECT_STORAGE)
export class UserController extends BaseController<UserControllerData> implements Controller {
  protected readonly roleRepository: Repository<Role>;
  protected readonly userRepository: UserRepository;

  constructor(options: UserControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-user', [NOUN_ROLE, NOUN_USER]);

    const storage = mustExist(options[INJECT_STORAGE]);
    this.roleRepository = storage.getRepository(Role);
    this.userRepository = storage.getCustomRepository(UserRepository);
  }

  @Handler(NOUN_ROLE, CommandVerb.Create)
  @CheckRBAC()
  public async createRole(cmd: Command, ctx: Context): Promise<void> {
    const name = cmd.getHead('name');
    const grants = cmd.get('grants');
    const role = await this.roleRepository.insert({
      grants,
      name,
    });
    return this.reply(ctx, role.toString());
  }

  @Handler(NOUN_ROLE, CommandVerb.Get)
  @CheckRBAC()
  public async getRole(cmd: Command, ctx: Context): Promise<void> {
    const name = cmd.get('name');
    const role = await this.roleRepository.findOne({
      where: {
        name,
      },
    });
    if (isNil(role)) {
      return this.reply(ctx, this.locale.translate('service.controller.user.role.missing'));
    } else {
      return this.reply(ctx, role.toString());
    }
  }

  @Handler(NOUN_ROLE, CommandVerb.List)
  @CheckRBAC()
  public async listRoles(cmd: Command, ctx: Context): Promise<void> {
    const roles = await this.roleRepository.createQueryBuilder('role').getMany();
    const roleText = roles.map((r) => r.toString()).join('\n');
    return this.reply(ctx, roleText);
  }

  @Handler(NOUN_USER, CommandVerb.Create)
  @CheckRBAC()
  public async createUser(cmd: Command, ctx: Context): Promise<void> {
    const name = cmd.getHeadOrDefault('name', ctx.name);
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

    return this.reply(ctx, user.toString());
  }

  @Handler(NOUN_USER, CommandVerb.Get)
  @CheckRBAC()
  public async getUser(cmd: Command, ctx: Context): Promise<void> {
    const name = cmd.getHead('name');
    const user = await this.userRepository.findOneOrFail({
      where: {
        name,
      },
    });
    await this.userRepository.loadRoles(user);
    return this.reply(ctx, user.toString());
  }

  @Handler(NOUN_USER, CommandVerb.Update)
  @CheckRBAC()
  public async updateUser(cmd: Command, ctx: Context): Promise<void> {
    const name = cmd.getHeadOrDefault('name', ctx.name);
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
    return this.reply(ctx, updatedUser.toString());
  }
}
