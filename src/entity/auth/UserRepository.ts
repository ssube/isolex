import { EntityRepository, In, Repository } from 'typeorm';

import { Role } from 'src/entity/auth/Role';
import { User } from 'src/entity/auth/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  public async loadRoles(user: User): Promise<User> {
    const roleRepo = this.manager.getRepository(Role);
    const roles = await roleRepo.find({
      where: {
        name: In(user.roleNames),
      },
    });
    user.roles = roles;
    return user;
  }
}
