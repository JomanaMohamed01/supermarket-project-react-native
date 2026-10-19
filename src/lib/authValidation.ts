const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "zoho.com",
]);

const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlo0k.com": "outlook.com",
  "outlokk.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.cm": "outlook.com",
  "outlook.con": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
};

function getEmailDomain(value: string) {
  const at = value.lastIndexOf("@");
  if (at < 0) return "";
  return value.slice(at + 1).trim().toLowerCase();
}

export function getEmailValidationError(value: string): string | null {
  const email = value.trim();
  const invalidMessage = "Email must be written correctly";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return invalidMessage;
  }

  const domain = getEmailDomain(email);
  if (!domain || COMMON_DOMAIN_TYPOS[domain] || !ALLOWED_EMAIL_DOMAINS.has(domain)) {
    return invalidMessage;
  }

  return null;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export function passwordHasNumberAndSpecialChar(password: string) {
  return /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export const PASSWORD_STRENGTH_COPY: Record<
  PasswordStrength,
  { label: string; colorKey: "danger" | "citrus" | "leaf" }
> = {
  weak: { label: "Weak password", colorKey: "danger" },
  medium: { label: "Medium password", colorKey: "citrus" },
  strong: { label: "Strong password", colorKey: "leaf" },
};
