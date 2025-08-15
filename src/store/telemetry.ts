import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TelemetryState, Telemetry } from '@/types';

export const useTelemetryStore = create<TelemetryState>()(
  persist(
    (set, get) => ({
      data: {},

      updateTiming: (brandId: string, type: string, ms: number) => {
        set(state => ({
          data: {
            ...state.data,
            [brandId]: {
              ...state.data[brandId],
              [`${type}_ms`]: ms,
              provider_usage: state.data[brandId]?.provider_usage || {},
            },
          },
        }));
      },

      incrementUsage: (brandId: string, provider: string) => {
        set(state => ({
          data: {
            ...state.data,
            [brandId]: {
              ...state.data[brandId],
              provider_usage: {
                ...state.data[brandId]?.provider_usage,
                [provider]: (state.data[brandId]?.provider_usage?.[provider] || 0) + 1,
              },
            },
          },
        }));
      },
    }),
    {
      name: 'flux-telemetry',
      version: 1,
    }
  )
);