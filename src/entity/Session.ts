import { User } from 'src/entity/auth/User';

export interface Session {
  createdAt: number;
  expiresAt: number;
  user: User;
}
