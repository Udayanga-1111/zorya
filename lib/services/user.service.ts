import prisma from '../db/prisma';
import { SignupInput, UserWithoutPassword } from '../types/user';
import { User } from '../../generated/prisma/client/client';

export async function registerUser(input: SignupInput & { password_hash: string }): Promise<UserWithoutPassword> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password_hash: input.password_hash,
      date_of_birth: new Date(input.date_of_birth),
      birth_location: input.birth_location,
      timezone: input.timezone,
    },
  });
  
  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return null;
  
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
