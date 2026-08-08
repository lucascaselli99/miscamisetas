/** Validaciones simples y compartidas para formularios. */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isRequired(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export const MIN_PASSWORD_LENGTH = 6;

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
