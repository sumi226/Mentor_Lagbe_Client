/**
 * Form validation for the sign-up and sign-in pages.
 *
 * Shared by both forms so the rules (required fields, email format, password
 * length) are identical to what the server enforces.
 */

export const MIN_PASSWORD_LENGTH = 8;

/** Pragmatic email check: something@something.tld with no spaces. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  role: string;
};

/** Returns an error message, or null when the sign-up form is valid. */
export function validateSignUp(input: SignUpInput): string | null {
  if (!input.name.trim()) return "Please enter your full name.";
  if (input.name.trim().length < 2) {
    return "Your name must be at least 2 characters long.";
  }
  if (!input.email.trim()) return "Please enter your email address.";
  if (!isValidEmail(input.email)) {
    return "Please enter a valid email address (e.g. you@example.com).";
  }
  if (!input.password) return "Please choose a password.";
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (input.role !== "student" && input.role !== "tutor" && input.role !== "admin") {
    return "Please choose whether you are joining as a Student, Tutor, or Admin.";
  }
  return null;
}

export type SignInInput = {
  email: string;
  password: string;
};

/** Returns an error message, or null when the sign-in form is valid. */
export function validateSignIn(input: SignInInput): string | null {
  if (!input.email.trim()) return "Please enter your email address.";
  if (!isValidEmail(input.email)) {
    return "Please enter a valid email address (e.g. you@example.com).";
  }
  if (!input.password) return "Please enter your password.";
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  return null;
}
