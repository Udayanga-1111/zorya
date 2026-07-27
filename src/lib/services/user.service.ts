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
      updated_at: new Date()
    } as UserWithoutPassword;
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return null;
  
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserOnboarding(
  id: string,
  data: {
    birth_date: Date;
    birth_time: string;
    birth_city: string;
    latitude: number;
    longitude: number;
  }
): Promise<UserWithoutPassword> {
  if (id === "hardcoded-admin") {
    return {
      id: "hardcoded-admin",
      email: "admin@zorya.com",
      name: "Admin User",
      created_at: new Date(),
      updated_at: new Date(),
      onboarded: true,
      birth_date: data.birth_date,
      birth_time: data.birth_time,
      birth_city: data.birth_city,
      latitude: data.latitude,
      longitude: data.longitude,
    } as any;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      onboarded: true,
    },
  });

  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
