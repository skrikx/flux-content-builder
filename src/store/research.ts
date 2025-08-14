import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResearchState, Idea } from '@/types';

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
      ideas: [],
      isRunning: false,
      lastRun: undefined,

      addIdeas: (ideas: Idea[]) => {
        set(state => ({
          ideas: [...state.ideas, ...ideas],
          lastRun: new Date(),
        }));
      },

      setRunning: (running: boolean) => {
        set({ isRunning: running });
      },

      clearIdeas: () => {
        set({ ideas: [] });
      },
    }),
    {
      name: 'flux-research',
      version: 1,
    }
  )
);