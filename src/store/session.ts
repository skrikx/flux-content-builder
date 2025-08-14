import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionState, UserSession } from '@/types';

// Mock user for demo
const mockUser: UserSession = {
  id: 'user-1',
  email: 'demo@fluxcontent.com',
  name: 'Demo User',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  isAuthenticated: true,
  createdAt: new Date(),
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock authentication - accept any email/password
        set({ 
          user: { ...mockUser, email },
          isLoading: false 
        });
      },

      logout: () => {
        set({ user: null });
      },

      updateUser: (updates: Partial<UserSession>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'flux-session',
      version: 1,
    }
  )
);