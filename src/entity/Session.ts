import { User } from './auth/User';

export interface Session {
  createdAt: Date;
  expiresAt: Date;
  user: User;
}
