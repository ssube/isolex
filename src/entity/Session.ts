import { User } from 'src/entity/auth/User';

export interface Session {
  createdAt: Date;
  expiresAt: Date;
  user: User;
}
