import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentState, ContentIdea, ContentItem, QueueItem } from '@/types';

// No mock data - real data comes from authenticated users

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

      generateContent: async (ideaId) => {
        set({ isGenerating: true });
        
        // Simulate content generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { ideas } = get();
        const idea = ideas.find(i => i.id === ideaId);
        
        if (idea) {
          const newContent: ContentItem = {
            id: `content-${Date.now()}`,
            brandId: idea.brandId,
            ideaId: idea.id,
            type: 'caption',
            title: `Generated: ${idea.title}`,
            content: `🚀 ${idea.description}\n\n#innovation #content #AI`,
            metadata: {
              hashtags: idea.keywords.map(k => `#${k}`),
            },
            status: 'draft',
            createdAt: new Date(),
          };
          
          set(state => ({
            items: [...state.items, newContent],
            isGenerating: false,
          }));
        } else {
          set({ isGenerating: false });
        }
      },

      scheduleContent: (contentId, date, platform) => {
        const newQueueItem: QueueItem = {
          id: `queue-${Date.now()}`,
          contentId,
          brandId: 'brand-1', // Get from content
      scheduledAt: date,
      platform: platform as 'IG' | 'TIKTOK' | 'YT' | 'X' | 'BLOG',
      status: 'SCHEDULED',
        };
        
        set(state => ({
          queue: [...state.queue, newQueueItem],
        }));
      },
    }),
    {
      name: 'flux-content',
      version: 1,
    }
  )
);