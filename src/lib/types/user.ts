import { User } from '../generated/prisma/client';

export type { User };

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface OnboardingInput {
  birth_date: string;     // ISO date string "YYYY-MM-DD"
  birth_time?: string;    // "HH:MM"
  birth_city: string;
  birth_country: string;
}
