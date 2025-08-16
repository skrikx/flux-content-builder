import { Brand, ContentItem, Idea, ProviderConfig, AssetRef } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useTelemetryStore } from '@/store/telemetry';

export interface GenerateOptions {
  brand: Brand;
  ideas: Idea[];
  platform?: string;
  count?: number;
  wordCount?: number;
  outlineDepth?: number;
}

async function generateText(brandId: string, topic: string, kind: 'caption' | 'post' | 'blog', mode = 'free') {
  const { data, error } = await supabase.functions.invoke('generate-text', {
    body: {
      brand_id: brandId,
      mode,
      kind,
      topic,
      length: kind === 'caption' ? 'short' : kind === 'post' ? 'medium' : 'long'
    }
  });

  if (error) {
    console.error('Text generation error:', error);
    throw new Error(error.message);
  }

  return data;
}

async function generateImage(brandId: string, prompt: string, mode = 'free') {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: {
      brand_id: brandId,
      mode,
      prompt,
      width: 1024,
      height: 1024
    }
  });

  if (error) {
    console.error('Image generation error:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function genCaptions(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 5 } = options;
  const items: ContentItem[] = [];

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    
    try {
      const topic = `${idea.topic}: ${idea.angle}`;
      const contentData = await generateText(brand.id, topic, 'caption');
      
      items.push({
        id: contentData.id,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'caption',
        title: contentData.title,
        text: contentData.data?.markdown || '',
        hashtags: [`#${brand.industry?.toLowerCase() || 'content'}`, '#social'],
        status: 'draft',
        createdAt: new Date(contentData.created_at),
      });
      
      useTelemetryStore.getState().incrementUsage(brand.id, 'text-generator');
    } catch (error) {
      console.warn('Caption generation failed:', error);
      
      // Fallback
      items.push({
        id: `content-${Date.now()}-${i}`,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'caption',
        title: `Caption: ${idea.topic}`,
        text: `🚀 ${idea.angle}\n\nWhat do you think? Drop a comment below!\n\n#${brand.industry?.toLowerCase() || 'content'} #innovation`,
        hashtags: [`#${brand.industry?.toLowerCase() || 'content'}`, '#innovation'],
        status: 'draft',
        createdAt: new Date(),
      });
    }
  }

  return items;
}

export async function genPosts(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 3 } = options;
  const items: ContentItem[] = [];

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    
    try {
      const topic = `${idea.topic}: ${idea.angle}`;
      const contentData = await generateText(brand.id, topic, 'post');
      
      items.push({
        id: contentData.id,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'post',
        title: contentData.title,
        text: contentData.data?.markdown || '',
        hashtags: [`#${brand.industry?.toLowerCase() || 'content'}`, '#innovation'],
        status: 'draft',
        createdAt: new Date(contentData.created_at),
      });
      
      useTelemetryStore.getState().incrementUsage(brand.id, 'text-generator');
    } catch (error) {
      console.warn('Post generation failed:', error);
      
      // Fallback
      items.push({
        id: `content-${Date.now()}-${i}`,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'post',
        title: `Post: ${idea.topic}`,
        text: `${idea.angle}\n\nHere's what you need to know about ${idea.topic}:\n\n🔹 Innovation is key\n🔹 Adaptation is crucial\n🔹 Success requires strategy\n\nWhat's your experience? Share in the comments!`,
        hashtags: [`#${brand.industry?.toLowerCase() || 'content'}`, '#innovation'],
        status: 'draft',
        createdAt: new Date(),
      });
    }
  }

  return items;
}

export async function genBlogs(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 2 } = options;
  const items: ContentItem[] = [];

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    
    try {
      const topic = `${idea.topic}: ${idea.angle}`;
      const contentData = await generateText(brand.id, topic, 'blog');
      
      items.push({
        id: contentData.id,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'blog',
        title: contentData.title,
        text: contentData.data?.markdown || '',
        metadata: { 
          wordCount: (contentData.data?.markdown || '').split(' ').length,
          estimatedReadTime: Math.ceil((contentData.data?.markdown || '').split(' ').length / 200),
        },
        status: 'draft',
        createdAt: new Date(contentData.created_at),
      });
      
      useTelemetryStore.getState().incrementUsage(brand.id, 'text-generator');
    } catch (error) {
      console.warn('Blog generation failed:', error);
      
      // Fallback
      items.push({
        id: `content-${Date.now()}-${i}`,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'blog',
        title: idea.angle,
        text: `# ${idea.angle}\n\n## Introduction\n\nIn today's landscape, understanding ${idea.topic} is crucial for success.\n\n## Key Insights\n\n### Innovation\nStaying ahead requires continuous learning.\n\n### Implementation\nPractical application creates real value.\n\n## Conclusion\n\n${idea.topic} represents both challenge and opportunity.`,
        metadata: { wordCount: 100, estimatedReadTime: 1 },
        status: 'draft',
        createdAt: new Date(),
      });
    }
  }

  return items;
}

export async function genImages(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 4 } = options;
  const items: ContentItem[] = [];

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    
    try {
      const prompt = `${idea.topic}, ${brand.industry || 'business'}, ${idea.keywords.join(', ')}, professional, high quality`;
      const contentData = await generateImage(brand.id, prompt);
      
      items.push({
        id: contentData.id,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'image',
        title: contentData.title,
        text: idea.angle,
        assets: [{
          kind: 'img',
          url: contentData.data?.url,
          prompt: contentData.data?.prompt,
          meta: { provider: 'ai-generated' },
        }],
        status: 'draft',
        createdAt: new Date(contentData.created_at),
      });
      
      useTelemetryStore.getState().incrementUsage(brand.id, 'image-generator');
    } catch (error) {
      console.warn('Image generation failed:', error);
      
      // Fallback: placeholder
      items.push({
        id: `content-${Date.now()}-${i}`,
        brandId: brand.id,
        ideaId: idea.id,
        type: 'image',
        title: `Image: ${idea.topic}`,
        text: idea.angle,
        assets: [{
          kind: 'img',
          url: `https://via.placeholder.com/1024x1024/4338ca/ffffff?text=${encodeURIComponent(idea.topic)}`,
          prompt: `Create an image about: ${idea.topic}. Keywords: ${idea.keywords.join(', ')}`,
          meta: { provider: 'placeholder' },
        }],
        status: 'draft',
        createdAt: new Date(),
      });
    }
  }

  return items;
}

export async function batchGenerate(
  types: ('caption' | 'post' | 'blog' | 'image' | 'video')[],
  count: number,
  brandId: string,
  config: ProviderConfig
): Promise<ContentItem[]> {
  const startTime = Date.now();
  const allItems: ContentItem[] = [];

  try {
    // Get brand from Supabase
    const { data: brand } = await supabase.functions.invoke('brands', {
      method: 'GET'
    });

    // Use sample ideas for now - in a real app, these would come from research
    const ideas: Idea[] = [
      {
        id: 'idea-1',
        brandId,
        topic: 'AI Innovation',
        angle: 'How AI is transforming business operations',
        keywords: ['AI', 'automation', 'efficiency'],
        confidence: 0.9,
        references: [],
        createdAt: new Date(),
      },
      {
        id: 'idea-2',
        brandId,
        topic: 'Digital Transformation',
        angle: 'Essential strategies for modern businesses',
        keywords: ['digital', 'strategy', 'growth'],
        confidence: 0.8,
        references: [],
        createdAt: new Date(),
      },
    ];

    const options: GenerateOptions = { 
      brand: {
        id: brandId,
        name: brand?.name || 'My Brand',
        description: brand?.description || '',
        industry: brand?.industry,
        targetAudience: brand?.target_audience,
        toneOfVoice: brand?.tone_of_voice,
        keywords: brand?.keywords || [],
        brandColors: brand?.brand_colors || ['#007bff'],
        socialHandles: brand?.social_handles || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ideas, 
      count 
    };

    // Generate content for each type
    for (const type of types) {
      let items: ContentItem[] = [];
      
      switch (type) {
        case 'caption':
          items = await genCaptions(options, config);
          break;
        case 'post':
          items = await genPosts(options, config);
          break;
        case 'blog':
          items = await genBlogs(options, config);
          break;
        case 'image':
          items = await genImages(options, config);
          break;
        case 'video':
          // Placeholder for video generation
          items = [{
            id: `content-${Date.now()}`,
            brandId,
            type: 'video',
            title: 'Video: AI Innovation',
            text: 'Video script about AI innovation in business',
            assets: [{
              kind: 'video',
              prompt: 'Create a video about AI innovation in business',
              meta: { provider: 'manual', suggested: true },
            }],
            status: 'draft',
            createdAt: new Date(),
          }];
          break;
      }
      
      allItems.push(...items);
    }

    // Record telemetry
    const duration = Date.now() - startTime;
    useTelemetryStore.getState().updateTiming(brandId, 'gen', duration);

    return allItems;
  } catch (error) {
    console.error('Batch generation failed:', error);
    return [];
  }
}