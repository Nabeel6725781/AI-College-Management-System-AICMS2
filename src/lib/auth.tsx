import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthSession as Session, AuthUser as User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; session: Session | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; session: Session | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setSigningIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session) {
      setSession(data.session);
    }
    await Promise.resolve();
    setSigningIn(false);
    return { error: error?.message || null, session: data?.session ?? null };
  };

  const signUp = async (email: string, password: string) => {
    setSigningIn(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data?.session) {
      setSession(data.session);
    }
    await Promise.resolve();
    setSigningIn(false);
    return { error: error?.message || null, session: data?.session ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message || null };
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signingIn, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
