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
  logoUrl?: string;
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

export interface Ref {
  url: string;
  title?: string;
  source?: 'web' | 'yt' | 'reddit' | 'rss';
  snippet?: string;
}

export interface AssetRef {
  kind: 'img' | 'video';
  url?: string;
  b64?: string;
  prompt?: string;
  meta?: Record<string, unknown>;
}

export interface Idea {
  id: string;
  brandId: string;
  topic: string;
  angle: string;
  keywords: string[];
  confidence: number;
  references: Ref[];
  createdAt: Date;
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
  ideaId?: string;
  type: 'caption' | 'post' | 'blog' | 'image' | 'video';
  title: string;
  text?: string;
  content?: string;
  assets?: AssetRef[];
  hashtags?: string[];
  personas?: string[];
  status: 'draft' | 'queued' | 'scheduled' | 'published';
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface QueueItem {
  id: string;
  brandId: string;
  contentId: string;
  platform: 'IG' | 'TIKTOK' | 'YT' | 'X' | 'BLOG';
  scheduledAt: Date;
  status: 'QUEUED' | 'SCHEDULED' | 'SENT' | 'FAILED';
}

export interface ExportJob {
  id: string;
  brandId: string;
  itemIds: string[];
  format: 'zip' | 'txt' | 'md' | 'json' | 'ics';
  status: 'pending' | 'running' | 'done' | 'error';
  resultUrl?: string;
}

export interface Telemetry {
  research_ms?: number;
  gen_ms?: number;
  exports_ms?: number;
  provider_usage: Record<string, number>;
}

export interface ProviderKeyMap {
  openai?: string;
  openrouter?: string;
  anthropic?: string;
  hf?: string;
  unsplash?: string;
  pexels?: string;
  newsapi?: string;
  serpapi?: string;
  serper?: string;
  tavily?: string;
  gdrive_client_id?: string;
  gdrive_client_secret?: string;
  dropbox?: string;
}

export interface ProviderTestResult {
  ok: boolean;
  message: string;
  at: string;
}

export interface ProviderConfig {
  id: string;
  brandId?: string;
  keys: ProviderKeyMap;
  toggles: Record<string, boolean>;
  lastTest?: Record<string, ProviderTestResult>;
  useProxy?: boolean;
}

export interface Provider {
  name: string;
  isReady(cfg: ProviderConfig): boolean;
  test(cfg: ProviderConfig): Promise<ProviderTestResult>;
  run(input: unknown, cfg: ProviderConfig): Promise<unknown>;
}

export interface ResearchPanel {
  id: string;
  title: string;
  type: 'trends' | 'competitors' | 'keywords';
  status: 'idle' | 'running' | 'completed' | 'error';
  results?: unknown[];
  lastRun?: Date;
}

// Store State Types
export interface SessionState {
  user: UserSession | null;
  isLoading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

export interface ProviderState {
  config: ProviderConfig;
  updateKeys: (keys: Partial<ProviderKeyMap>) => void;
  updateToggles: (toggles: Record<string, boolean>) => void;
  setTestResult: (provider: string, result: ProviderTestResult) => void;
  setUseProxy: (useProxy: boolean) => void;
}

export interface ResearchState {
  ideas: Idea[];
  isRunning: boolean;
  lastRun?: Date;
  addIdeas: (ideas: Idea[]) => void;
  setRunning: (running: boolean) => void;
  clearIdeas: () => void;
}

export interface TelemetryState {
  data: Record<string, Telemetry>;
  updateTiming: (brandId: string, type: string, ms: number) => void;
  incrementUsage: (brandId: string, provider: string) => void;
}

export interface ContentState {
  ideas: ContentIdea[];
  items: ContentItem[];
  queue: QueueItem[];
  isGenerating: boolean;
  addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  addItem: (item: ContentItem) => void;
  loadContent: (brandId?: string) => Promise<void>;
  loadQueue: () => Promise<void>;
  generateContent: (types: string[], count: number, brandId: string) => Promise<ContentItem[]>;
  scheduleContent: (contentId: string, date: Date, platform: string) => Promise<void>;
}