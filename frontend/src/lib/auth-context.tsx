import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLogin, useRegister } from '@workspace/api-client-react';
import type { RegisterInput, User } from '@workspace/api-client-react';
import { applyAppearance, getSavedTheme, getSavedFontScale, resetAppearance } from '@/lib/appearance';

const STORAGE_KEY = 'nyayaconnect.session';

interface Session {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: (User & Partial<ProfilePatch>) | null;
  token: string | null;
  isAuthenticated: boolean;
  isLawyer: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => void;
  updateUser: (patch: ProfilePatch) => void;
}

export interface ProfilePatch {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  avatar?: string | null;
  dob?: string;
  gender?: string;
  street?: string;
  pincode?: string;
  language?: string;
  communication?: string;
  bci?: string;
  experience?: string;
  address?: string;
  fee?: string;
  bio?: string;
  practiceAreas?: string[];
  languages?: string[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'token' in parsed && 'user' in parsed) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      const next = {
        token: result.token,
        user: result.user,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(next);
      applyAppearance(getSavedTheme(next.user.id), getSavedFontScale(next.user.id), next.user.id);
      return next.user;
    },
    [loginMutation],
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const result = await registerMutation.mutateAsync({ data: input });
      const next = { token: result.token, user: result.user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(next);
      applyAppearance(getSavedTheme(next.user.id), getSavedFontScale(next.user.id), next.user.id);
      return result.user;
    },
    [registerMutation],
  );

  const signOut = useCallback(() => {
    resetAppearance();
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const updateUser = useCallback((patch: ProfilePatch) => {
    setSession(prev => {
      if (!prev) return prev;
      const next = { ...prev, user: { ...prev.user, ...patch } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session != null,
      isLawyer: session?.user.role === 'lawyer',
      signIn,
      signUp,
      signOut,
      updateUser,
    }),
    [session, signIn, signUp, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
