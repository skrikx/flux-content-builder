// FluxContent Core Types

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAuthenticated: boolean;
  createdAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  industry: string;
  targetAudience: string;
  toneOfVoice: string;
  keywords: string[];
  brandColors: string[];
  logo?: string;
  website?: string;
  socialHandles: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentIdea {
  id: string;
  brandId: string;
  title: string;
  description: string;
  category: 'social' | 'blog' | 'email' | 'ad';
  keywords: string[];
  targetAudience: string;
  status: 'draft' | 'researching' | 'ready' | 'published';
  scheduledDate?: Date;
  createdAt: Date;
}

export interface ContentItem {
  id: string;
  brandId: string;
  ideaId: string;
  type: 'caption' | 'post' | 'blog' | 'image' | 'video';
  title: string;
  content: string;
  metadata: {
    wordCount?: number;
    estimatedReadTime?: number;
    hashtags?: string[];
    imageUrl?: string;
    videoUrl?: string;
  };
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: Date;
}

export interface QueueItem {
  id: string;
  contentId: string;
  brandId: string;
  scheduledDate: Date;
  platform: string;
  status: 'scheduled' | 'published' | 'failed';
  publishedAt?: Date;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'stability' | 'social';
  apiKey: string;
  isActive: boolean;
  lastTested?: Date;
  settings: Record<string, any>;
}

export interface ResearchPanel {
  id: string;
  title: string;
  type: 'trends' | 'competitors' | 'keywords';
  status: 'idle' | 'running' | 'completed' | 'error';
  results?: any[];
  lastRun?: Date;
}

// Store State Types
export interface SessionState {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserSession>) => void;
}

export interface BrandState {
  brands: Brand[];
  activeBrand: Brand | null;
  isLoading: boolean;
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  setActiveBrand: (brandId: string) => void;
  deleteBrand: (id: string) => void;
}

export interface ContentState {
  ideas: ContentIdea[];
  items: ContentItem[];
  queue: QueueItem[];
  isGenerating: boolean;
  addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  generateContent: (ideaId: string) => Promise<void>;
  scheduleContent: (contentId: string, date: Date, platform: string) => void;
}