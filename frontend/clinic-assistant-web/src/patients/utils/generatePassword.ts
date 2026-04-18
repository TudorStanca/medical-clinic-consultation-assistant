const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*";
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

export function generatePassword(): string {
  const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)];
  const rest = Array.from({ length: 8 }, () => pick(ALL));
  const combined = [...required, ...rest];

  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}
