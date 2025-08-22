import { Brand, ContentItem, Idea, ProviderConfig } from '@/types';
import { useTelemetryStore } from '@/store/telemetry';
import { invokeWithAuth } from '@/lib/invoke';
import { useResearchStore } from '@/store/research';

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function assertBrandUUID(brandId: string) {
  if (!uuidRe.test(brandId)) { throw new Error('Select or create a Brand first - invalid brand id'); }
}

async function generateText(brandId: string, topic: string, kind: 'caption'|'post'|'blog', mode = 'free') {
  const { data, error } = await invokeWithAuth('generate-text', { method:'POST', body:{ brand_id: brandId, mode, topic, kind } });
  if (error) throw new Error(error.message);
  return data;
}
async function generateImage(brandId: string, prompt: string, mode = 'free') {
  const { data, error } = await invokeWithAuth('generate-image', { method:'POST', body:{ brand_id: brandId, mode, prompt } });
  if (error) throw new Error(error.message);
  return data;
}
async function generateVideo(brandId: string, script: string, mode = 'free') {
  const { data, error } = await invokeWithAuth('generate-video', { method:'POST', body:{ brand_id: brandId, mode, script } });
  if (error) throw new Error(error.message);
  return data;
}

export async function genCaptions({ brand, ideas, count = 5 }:{brand:Brand;ideas:Idea[];count?:number}, config: ProviderConfig): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    try {
      const topic = `${idea.topic}: ${idea.angle}`;
      const contentData = await generateText(brand.id, topic, 'caption', config.toggles?.usePremium ? 'premium' : 'free');
      items.push({ id: contentData.id, brandId: brand.id, ideaId: idea.id, type: 'caption', title: contentData.title, text: contentData.data?.text || '', hashtags: contentData.data?.hashtags || [], status: 'draft', createdAt: new Date(contentData.created_at) });
      useTelemetryStore.getState().incrementUsage(brand.id, 'text-generator');
    } catch (e) { console.warn('Caption generation failed:', e); }
  }
  return items;
}

export async function genPosts({ brand, ideas, count = 3 }:{brand:Brand;ideas:Idea[];count?:number}, config: ProviderConfig): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    try {
      const topic = `${idea.topic}: ${idea.angle}`;
      const contentData = await generateText(brand.id, topic, 'post', config.toggles?.usePremium ? 'premium' : 'free');
      items.push({ id: contentData.id, brandId: brand.id, ideaId: idea.id, type: 'post', title: contentData.title, text: contentData.data?.markdown || '', hashtags: [`#${brand.industry?.toLowerCase() || 'content'}`, '#innovation'], status: 'draft', createdAt: new Date(contentData.created_at) });
      useTelemetryStore.getState().incrementUsage(brand.id, 'text-generator');
    } catch (e) { console.warn('Post generation failed:', e); }
  }
  return items;
}

export async function genBlogs({ brand, ideas, count = 1 }:{brand:Brand;ideas:Idea[];count?:number}, config: ProviderConfig): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    try {
      const topic = `${idea.topic}: ${idea.angle}`;
      const contentData = await generateText(brand.id, topic, 'blog', config.toggles?.usePremium ? 'premium' : 'free');
      const md = contentData.data?.markdown || '';
      items.push({ id: contentData.id, brandId: brand.id, ideaId: idea.id, type: 'blog', title: contentData.title, text: md, hashtags: [`#${brand.industry?.toLowerCase() || 'content'}`, '#blog'], metadata: { wordCount: md.split(' ').length, estimatedReadTime: Math.ceil(md.split(' ').length/200) }, status: 'draft', createdAt: new Date(contentData.created_at) });
      useTelemetryStore.getState().incrementUsage(brand.id, 'text-generator');
    } catch (e) { console.warn('Blog generation failed:', e); }
  }
  return items;
}

export async function genImages({ brand, ideas, count = 4 }:{brand:Brand;ideas:Idea[];count?:number}, config: ProviderConfig): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    try {
      const prompt = `${idea.topic}, ${brand.industry || 'business'}, ${idea.keywords.join(', ')}, professional, high quality`;
      const contentData = await generateImage(brand.id, prompt, config.toggles?.usePremium ? 'premium' : 'free');
      items.push({ id: contentData.id, brandId: brand.id, ideaId: idea.id, type: 'image', title: `Image: ${idea.topic}`, text: idea.angle, assets: contentData.data?.url ? [{ kind: 'img', url: contentData.data.url, prompt }] : [], status: 'draft', createdAt: new Date(contentData.created_at) });
      useTelemetryStore.getState().incrementUsage(brand.id, 'image-generator');
    } catch (e) { console.warn('Image generation failed:', e); }
  }
  return items;
}

type DatabaseBrandRow = {
  id: string;
  name: string;
  voice?: string;
  tone?: string;
  style?: {
    industry?: string;
    audience?: string;
    keywords?: string[];
    colors?: string[];
  };
  assets?: {
    website?: string;
    logo?: string;
    social?: Record<string, string>;
  };
  created_at: string;
  updated_at?: string;
};

export async function batchGenerate(types: ('caption'|'post'|'blog'|'image'|'video')[], count: number, brandId: string, config: ProviderConfig): Promise<ContentItem[]> {
  assertBrandUUID(brandId);
  const startTime = Date.now();
  const allItems: ContentItem[] = [];

  try {
    let brandRow: DatabaseBrandRow | null = null;
    const { data: maybeSingle } = await invokeWithAuth('brands', { method:'GET', params:{ id: brandId } });
    if (maybeSingle && !Array.isArray(maybeSingle)) { brandRow = maybeSingle; }
    else {
      const { data: list } = await invokeWithAuth('brands', { method:'GET' });
      brandRow = Array.isArray(list) ? list.find((b: DatabaseBrandRow) => b.id === brandId) : null;
    }
    if (!brandRow) throw new Error('Brand not found for generation');

    const brand: Brand = {
      id: brandRow.id, name: brandRow.name, description: brandRow.voice ?? '',
      industry: brandRow.style?.industry ?? 'General', targetAudience: brandRow.style?.audience ?? '',
      toneOfVoice: brandRow.tone ?? '', keywords: brandRow.style?.keywords ?? [], brandColors: brandRow.style?.colors ?? ['#007bff'],
      website: brandRow.assets?.website, logoUrl: brandRow.assets?.logo, socialHandles: brandRow.assets?.social ?? {},
      createdAt: new Date(brandRow.created_at), updatedAt: new Date(brandRow.updated_at ?? brandRow.created_at),
    };

    const ideasFromStore = useResearchStore.getState().ideas || [];
    const ideas: Idea[] = (ideasFromStore.length ? ideasFromStore : [
      { id: 'idea-1', brandId, topic: 'AI Innovation', angle: 'How AI is transforming business operations', keywords: ['AI','automation','efficiency'], confidence: 0.9, references: [], createdAt: new Date() },
      { id: 'idea-2', brandId, topic: 'Digital Transformation', angle: 'Essential strategies for modern businesses', keywords: ['cloud','data','change'], confidence: 0.8, references: [], createdAt: new Date() },
    ]) as Idea[];

    for (const type of types) {
      let items: ContentItem[] = [];
      switch (type) {
        case 'caption': items = await genCaptions({ brand, ideas, count }, config); break;
        case 'post': items = await genPosts({ brand, ideas, count }, config); break;
        case 'blog': items = await genBlogs({ brand, ideas, count }, config); break;
        case 'image': items = await genImages({ brand, ideas, count }, config); break;
        case 'video': {
          // Skip video generation in free tier - requires premium API keys
          if (!config.toggles?.usePremium) {
            console.log('Video generation skipped - requires premium tier');
            break;
          }
          const script = `Video script about ${ideas[0]?.topic || 'your brand'}`;
          const contentData = await generateVideo(brand.id, script, 'premium');
          items = [{
            id: contentData.id, brandId: brand.id, type: 'video', title: contentData.title,
            text: contentData.data?.script || '', assets: contentData.data?.url ? [{ kind: 'video', url: contentData.data.url }] : [],
            status: contentData.status || 'draft', createdAt: new Date(contentData.created_at),
          }];
          break;
        }
      }
      allItems.push(...items);
    }

    const duration = Date.now() - startTime;
    useTelemetryStore.getState().updateTiming(brandId, 'gen', duration);
    return allItems;
  } catch (error) {
    console.error('Batch generation failed:', error);
    return [];
  }
}
