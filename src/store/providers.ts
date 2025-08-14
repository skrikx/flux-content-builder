import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProviderState, ProviderConfig, ProviderKeyMap, ProviderTestResult } from '@/types';

const initialConfig: ProviderConfig = {
  id: 'default',
  keys: {},
  toggles: {
    usePremium: false,
    useProxy: false,
    autoSchedule: true,
  },
  lastTest: {},
  useProxy: false,
};

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      config: initialConfig,

      updateKeys: (keys: Partial<ProviderKeyMap>) => {
        set(state => ({
          config: {
            ...state.config,
            keys: { ...state.config.keys, ...keys },
          },
        }));
      },

      updateToggles: (toggles: Record<string, boolean>) => {
        set(state => ({
          config: {
            ...state.config,
            toggles: { ...state.config.toggles, ...toggles },
          },
        }));
      },

      setTestResult: (provider: string, result: ProviderTestResult) => {
        set(state => ({
          config: {
            ...state.config,
            lastTest: {
              ...state.config.lastTest,
              [provider]: result,
            },
          },
        }));
      },

      setUseProxy: (useProxy: boolean) => {
        set(state => ({
          config: {
            ...state.config,
            useProxy,
          },
        }));
      },
    }),
    {
      name: 'flux-providers',
      version: 2,
    }
  )
);