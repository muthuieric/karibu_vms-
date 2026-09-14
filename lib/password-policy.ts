export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

export const DEFAULT_HOST_PASSWORD = "Host@Karibu2026!";

export function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

export function generateTemporaryPassword(length = 12): string {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const special = "!@#$%*?";

  const getRandom = (chars: string) => chars.charAt(Math.floor(Math.random() * chars.length));

  const required = [
    getRandom(lowercase),
    getRandom(uppercase),
    getRandom(numbers),
    getRandom(special),
  ];

  const allChars = lowercase + uppercase + numbers + special;
  const remainingCount = Math.max(0, length - required.length);
  for (let i = 0; i < remainingCount; i++) {
    required.push(getRandom(allChars));
  }

  // Fisher-Yates shuffle
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }

  const password = required.join("");
  if (!isStrongPassword(password)) {
    return `K!${password.substring(2)}a1`;
  }
  return password;
}

