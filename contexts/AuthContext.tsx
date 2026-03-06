import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '../lib/types';

// ─── Toggle this to switch between mock and real Supabase ─────
const USE_MOCK = true;
// ─────────────────────────────────────────────────────────────

// Lazy imports to avoid loading both at once
const getAuthModule = () =>
  USE_MOCK ? require('../lib/api.mock') : { supabase: require('../lib/supabase').supabase };

// Dummy types when using mock (no Supabase User/Session needed)
type Session = any;
type User = any;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (USE_MOCK) {
      const { profiles } = getAuthModule();
      const data = await profiles.getById(userId);
      setProfile(data);
    } else {
      const { supabase } = getAuthModule();
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) await fetchProfile(session.user.id);
  };

  const signIn = async (email: string, password: string) => {
    if (USE_MOCK) {
      const { auth } = getAuthModule();
      const { data, error } = await auth.signIn(email, password);
      if (!error && data?.session) {
        setSession(data.session);
        if (data.session?.user?.id) await fetchProfile(data.session.user.id);
      }
      return { error };
    } else {
      const { supabase } = getAuthModule();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    }
  };

  const signOut = async () => {
    if (USE_MOCK) {
      const { auth } = getAuthModule();
      await auth.signOut();
    } else {
      const { supabase } = getAuthModule();
      await supabase.auth.signOut();
    }
    setProfile(null);
    setSession(null);
  };

  useEffect(() => {
    if (USE_MOCK) {
      // Mock: just check if there's a stored session
      const { auth } = getAuthModule();
      auth.getSession().then(({ data }: any) => {
        const s = data?.session ?? null;
        setSession(s);
        if (s?.user?.id) fetchProfile(s.user.id);
        setLoading(false);
      });
    } else {
      const { supabase } = getAuthModule();
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setSession(session);
        if (session?.user) fetchProfile(session.user.id);
        setLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        role: profile?.role ?? null,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
