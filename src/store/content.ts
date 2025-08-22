import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentState, ContentIdea, ContentItem, QueueItem } from '@/types';
import { getContent } from '@/lib/content';
import { listSchedules, createSchedule } from '@/lib/schedule';
import { batchGenerate } from '@/lib/generate';
import { useProviderStore } from '@/store/providers';

interface DatabaseSchedule {
  id: string;
  content_id: string;
  publish_time: string;
  platform: string;
  status: string;
  content?: {
    brand_id?: string;
  };
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      ideas: [],
      items: [],
      queue: [],
      isGenerating: false,

      addIdea: (ideaData) => {
        const newIdea: ContentIdea = {
          ...ideaData,
          id: `idea-${Date.now()}`,
          createdAt: new Date(),
        };
        
        set(state => ({
          ideas: [...state.ideas, newIdea],
        }));
      },

      addItem: (item: ContentItem) => {
        set(state => ({
          items: [...state.items, item],
        }));
      },

      loadContent: async (brandId?: string) => {
        try {
          const content = await getContent(brandId);
          set({ items: content });
        } catch (error) {
          console.error('Failed to load content:', error);
        }
      },

      loadQueue: async () => {
        try {
          const schedules = await listSchedules();
          const queueItems: QueueItem[] = schedules.map((schedule: DatabaseSchedule) => ({
            id: schedule.id,
            contentId: schedule.content_id,
            brandId: schedule.content?.brand_id || '',
            scheduledAt: new Date(schedule.publish_time),
            platform: schedule.platform as 'IG' | 'TIKTOK' | 'YT' | 'X' | 'BLOG',
            status: schedule.status === 'pending' ? 'SCHEDULED' : schedule.status.toUpperCase(),
          }));
          set({ queue: queueItems });
        } catch (error) {
          console.error('Failed to load queue:', error);
        }
      },

      generateContent: async (types: string[], count: number, brandId: string) => {
        set({ isGenerating: true });
        
        try {
          const providerState = useProviderStore.getState();
          const newContent = await batchGenerate(
            types as ('caption' | 'post' | 'blog' | 'image' | 'video')[],
            count,
            brandId,
            providerState.config
          );
          
          set(state => ({
            items: [...state.items, ...newContent],
            isGenerating: false,
          }));
          
          return newContent;
        } catch (error) {
          console.error('Content generation failed:', error);
          set({ isGenerating: false });
          throw error;
        }
      },

      scheduleContent: async (contentId, date, platform) => {
        try {
          await createSchedule(contentId, 'buffer', date.toISOString());
          
          const newQueueItem: QueueItem = {
            id: `queue-${Date.now()}`,
            contentId,
            brandId: '',
            scheduledAt: date,
            platform: platform as 'IG' | 'TIKTOK' | 'YT' | 'X' | 'BLOG',
            status: 'SCHEDULED',
          };
          
          set(state => ({
            queue: [...state.queue, newQueueItem],
          }));
        } catch (error) {
          console.error('Failed to schedule content:', error);
          throw error;
        }
      },
    }),
    {
      name: 'flux-content',
      version: 2,
    }
  )
);