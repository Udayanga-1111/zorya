import { User } from '../../generated/prisma/client/client';

export type { User };

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  date_of_birth: string; // ISO string for API input
  birth_location: string;
  timezone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
