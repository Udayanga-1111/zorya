import prisma from "@/lib/db/prisma";
import { OnboardingInput } from "@/lib/types/user";

/**
 * Derives the Western sun sign from a birth date.
 */
export function deriveSunSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1; // 1-based
  const day = birthDate.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

/**
 * Returns the zodiac symbol for a given sign name.
 */
export function getZodiacSymbol(sign: string): string {
  const symbols: Record<string, string> = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
  };
  return symbols[sign] ?? "✦";
}

/**
 * Saves the user's birth data and marks them as onboarded.
 */
export async function saveOnboardingData(
  userId: string,
  data: OnboardingInput
): Promise<void> {
  const birthDate = new Date(data.birth_date);
  const sunSign = deriveSunSign(birthDate);

  await prisma.user.update({
    where: { id: userId },
    data: {
      birth_date: birthDate,
      birth_time: data.birth_time ?? null,
      birth_city: data.birth_city,
      birth_country: data.birth_country,
      sun_sign: sunSign,
      onboarded: true,
    },
  });
}
