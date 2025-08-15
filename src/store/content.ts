import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentState, ContentIdea, ContentItem, QueueItem } from '@/types';

// Mock data for demo
const mockIdeas: ContentIdea[] = [
  {
    id: 'idea-1',
    brandId: 'brand-1',
    title: 'AI Revolution in Business',
    description: 'How artificial intelligence is transforming modern business operations',
    category: 'blog',
    keywords: ['AI', 'business', 'transformation', 'automation'],
    targetAudience: 'Business executives and tech leaders',
    status: 'ready',
    scheduledDate: new Date('2024-08-20'),
    createdAt: new Date('2024-08-10'),
  },
  {
    id: 'idea-2',
    brandId: 'brand-1',
    title: 'Product Launch Announcement',
    description: 'Exciting new features in our latest software update',
    category: 'social',
    keywords: ['product launch', 'features', 'update'],
    targetAudience: 'Existing customers and prospects',
    status: 'draft',
    createdAt: new Date('2024-08-12'),
  },
];

const mockContent: ContentItem[] = [
  {
    id: 'content-1',
    brandId: 'brand-1',
    ideaId: 'idea-1',
    type: 'blog',
    title: 'The AI Revolution: Transforming Business Operations in 2024',
    content: 'Artificial intelligence is no longer a futuristic concept...',
    metadata: {
      wordCount: 1200,
      estimatedReadTime: 5,
      hashtags: ['#AI', '#Business', '#Innovation'],
    },
    status: 'published',
    createdAt: new Date('2024-08-11'),
  },
];

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      ideas: mockIdeas,
      items: mockContent,
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