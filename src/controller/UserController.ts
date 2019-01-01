import { Inject } from 'noicejs';
import { Connection, In, Repository } from 'typeorm';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Role } from 'src/entity/auth/Role';
import { User } from 'src/entity/auth/User';
import { UserRepository } from 'src/entity/auth/UserRepository';
import { Command, CommandVerb } from 'src/entity/Command';

export const NOUN_ROLE = 'role';
export const NOUN_USER = 'user';

export type UserControllerData = ControllerData;
export type UserControllerOptions = ControllerOptions<UserControllerData>;

@Inject('storage')
export class UserController extends BaseController<UserControllerData> implements Controller {
  protected readonly roleRepository: Repository<Role>;
  protected readonly storage: Connection;
  protected readonly userRepository: UserRepository;

  constructor(options: UserControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-user', [NOUN_ROLE, NOUN_USER]);

    this.storage = options.storage;
    this.roleRepository = this.storage.getRepository(Role);
    this.userRepository = this.storage.getCustomRepository(UserRepository);
  }

  @HandleNoun(NOUN_ROLE)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
  public async createRole(cmd: Command): Promise<void> {
    const name = cmd.getHead('name');
    const grants = cmd.get('grants');
    const role = await this.roleRepository.insert({
      grants,
      name,
    });
    return this.reply(cmd.context, role.toString());
  }

  @HandleNoun(NOUN_ROLE)
  @HandleVerb(CommandVerb.Get)
  @CheckRBAC()
  public async getRole(cmd: Command): Promise<void> {
    const name = cmd.get('name');
    const role = await this.roleRepository.findOne({
      where: {
        name,
      },
    });
    if (role) {
      return this.reply(cmd.context, role.toString());
    } else {
      return this.reply(cmd.context, 'role not found');
    }
  }

  @HandleNoun(NOUN_ROLE)
  @HandleVerb(CommandVerb.List)
  @CheckRBAC()
  public async listRoles(cmd: Command): Promise<void> {
    const roles = await this.roleRepository.createQueryBuilder('role').getMany();
    const roleText = roles.map((r) => r.toString()).join('\n');
    return this.reply(cmd.context, roleText);
  }

  @HandleNoun(NOUN_USER)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
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

    return this.reply(cmd.context, user.toString());
  }

  @HandleNoun(NOUN_USER)
  @HandleVerb(CommandVerb.Get)
  @CheckRBAC()
  public async getUser(cmd: Command): Promise<void> {
    const name = cmd.getHead('name');
    const user = await this.userRepository.findOneOrFail({
      where: {
        name,
      },
    });
    await this.userRepository.loadRoles(user);
    return this.reply(cmd.context, user.toString());
  }

  @HandleNoun(NOUN_USER)
  @HandleVerb(CommandVerb.Update)
  @CheckRBAC()
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
    return this.reply(cmd.context, updatedUser.toString());
  }
}
