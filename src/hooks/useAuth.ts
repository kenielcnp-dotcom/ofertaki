import { useState } from 'react';
import { authService } from '../services/auth.service';
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '../utils/validation';

export function useAuth() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUp(input: SignUpInput) {
    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    const { error: signUpError } = await authService.signUp(parsed.data);
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return false;
    }
    return true;
  }

  async function signIn(input: SignInInput) {
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return false;
    }
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await authService.signIn(parsed.data);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return false;
    }
    return true;
  }

  return { signUp, signIn, submitting, error };
}
