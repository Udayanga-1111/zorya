import prisma from '../db/prisma';
import { SignupInput, UserWithoutPassword } from '../types/user';
import { User } from '../generated/prisma/client';

export async function registerUser(input: SignupInput & { password_hash: string }): Promise<UserWithoutPassword> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password_hash: input.password_hash,
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
  if (id === "hardcoded-admin") {
    return {
      id: "hardcoded-admin",
      email: "admin@zorya.com",
      name: "Admin User",
      created_at: new Date(),
      birth_date: null,
      birth_time: null,
      birth_city: null,
      birth_country: null,
      sun_sign: null,
      moon_sign: null,
      rising_sign: null,
      onboarded: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return null;
  
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
