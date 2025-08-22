import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
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
        
        // Set up auth state listener first
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[Session] Auth state changed:', event, !!session?.user);
          const user = mapUser(session);
          set({ user, isLoading: false });
          
          // Call onboard when user becomes authenticated
          if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            setTimeout(() => fetchOnboard(), 100);
          }
        });

        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Session] Initial session check:', !!session?.user);
        const user = mapUser(session);
        set({ user, isLoading: false });
        
        // Call onboard for existing session
        if (session?.user) {
          setTimeout(() => fetchOnboard(), 100);
        }
      },

      async login(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onboard will be called via auth state change
      },

      async signup(email: string, password: string) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        // onboard will be called via auth state change
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

function mapUser(s: { user: User } | Session | null): UserSession | null {
  const u = s && 'user' in s ? s.user : (s as Session)?.user;
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
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.warn('[Session] No access token available for onboard');
      return;
    }
    
    console.log('[Session] Calling onboard with auth token');
    const { data, error } = await supabase.functions.invoke('onboard', { 
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    
    if (error) {
      console.error('[Session] Onboard error:', error);
    } else {
      console.log('[Session] Onboard success:', data);
    }
  } catch (e) {
    console.error('[Session] Onboard exception:', e);
  }
}
