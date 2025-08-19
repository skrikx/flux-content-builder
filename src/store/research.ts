import { create } from 'zustand';
import { Idea } from '@/types';

type SourceKey = 'tavily' | 'reddit' | 'hn' | 'wikipedia';

type ResearchState = {
  query: string;
  sources: Record<SourceKey, boolean>;
  ideas: Idea[];
  setQuery: (q: string) => void;
  toggleSource: (s: SourceKey) => void;
  setSources: (m: Partial<Record<SourceKey, boolean>>) => void;
  setIdeas: (ideas: Idea[]) => void;
  clear: () => void;
};

export const useResearchStore = create<ResearchState>((set, get) => ({
  query: '',
  sources: { tavily: true, reddit: true, hn: true, wikipedia: true },
  ideas: [],
  setQuery: (q) => set({ query: q }),
  toggleSource: (s) => set({ sources: { ...get().sources, [s]: !get().sources[s] } }),
  setSources: (m) => set({ sources: { ...get().sources, ...m } }),
  setIdeas: (ideas) => set({ ideas }),
  clear: () => set({ query: '', ideas: [] }),
}));
