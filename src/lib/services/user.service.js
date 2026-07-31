import prisma from '../db/prisma';

export async function registerUser(input) {
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

export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id) {
  if (id === "hardcoded-admin") {
    return {
      id: "hardcoded-admin",
      email: "admin@zorya.com",
      name: "Admin User",
      created_at: new Date(),
      updated_at: new Date(),
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

export async function updateUserOnboarding(id, data) {
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
      is_approximate_time: data.is_approximate_time,
      latitude: data.latitude,
      longitude: data.longitude,
    };
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
