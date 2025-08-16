import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SessionState, UserSession } from '@/types';

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      async init() {
        if (get().isLoading) return;
        set({ isLoading: true });
        
        console.log('[Session] Initializing session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Session] Got session:', !!session, session?.user?.id);
        
        if (session?.user) {
          set({ user: mapUser(session), isLoading: false });
          console.log('[Session] User authenticated:', session.user.id);
          try { await fetchOnboard(); } catch (e) { console.warn('[Session] Onboard failed:', e); }
        } else {
          set({ user: null, isLoading: false });
          console.log('[Session] No session found');
        }

        supabase.auth.onAuthStateChange((_event, s) => {
          console.log('[Session] Auth state changed:', _event, !!s);
          set({ user: s?.user ? mapUser(s) : null });
        });
      },

      async login(email: string, password: string) {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        set({ user: mapUser(data), isLoading: false });
        try { await fetchOnboard(); } catch {}
      },

      async signup(email: string, password: string) {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        set({ user: mapUser(data), isLoading: false });
        try { await fetchOnboard(); } catch {}
      },

      async logout() {
        await supabase.auth.signOut();
        set({ user: null });
      },

      updateUser(updates: Partial<UserSession>) {
        const { user } = get();
        if (user) set({ user: { ...user, ...updates } });
      },
    }),
    { name: 'flux-session', version: 2 }
  )
);

function mapUser(s: { user: any } | Session | null): UserSession | null {
  const u = (s as any)?.user;
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? '',
    name: u.user_metadata?.name ?? u.email ?? 'User',
    avatar: u.user_metadata?.avatar_url,
    isAuthenticated: true,
    createdAt: new Date(u.created_at),
  };
}

async function fetchOnboard() {
  await supabase.functions.invoke('onboard', { method: 'POST' });
}