import { Brand, ContentItem, Idea, ProviderConfig, AssetRef } from '@/types';
import { llmProviders } from '@/providers/llm';
import { imageProviders } from '@/providers/image';
import { useTelemetryStore } from '@/store/telemetry';

export interface GenerateOptions {
  brand: Brand;
  ideas: Idea[];
  platform?: string;
  count?: number;
  wordCount?: number;
  outlineDepth?: number;
}

export async function genCaptions(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 5 } = options;
  const items: ContentItem[] = [];

  const llmProvider = llmProviders.openrouter.isReady(config) 
    ? llmProviders.openrouter 
    : llmProviders.huggingface.isReady(config) 
    ? llmProviders.huggingface 
    : null;

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    let content = '';
    let hashtags: string[] = [];

    if (llmProvider) {
      try {
        const prompt = `Write an engaging social media caption for a ${brand.industry} brand.
        
        Brand: ${brand.name}
        Tone: ${brand.toneOfVoice}
        Target Audience: ${brand.targetAudience}
        Topic: ${idea.topic}
        Angle: ${idea.angle}
        Keywords: ${idea.keywords.join(', ')}
        
        Requirements:
        - 150-280 characters
        - Include relevant hashtags
        - Engaging and on-brand
        - Include a call to action
        
        Format:
        Caption: [caption text]
        Hashtags: #hashtag1 #hashtag2 #hashtag3`;

        const response = await llmProvider.run({ prompt, maxTokens: 300 }, config);
        
        const captionMatch = response.match(/Caption: ([^\n]+)/);
        const hashtagMatch = response.match(/Hashtags: (.+)/);
        
        content = captionMatch?.[1] || '';
        hashtags = hashtagMatch?.[1]?.split(' ').filter(h => h.startsWith('#')) || [];
        
        useTelemetryStore.getState().incrementUsage(brand.id, llmProvider.name);
      } catch (error) {
        console.warn('LLM caption generation failed:', error);
      }
    }

    // Fallback template
    if (!content) {
      content = `🚀 ${idea.angle}\n\nWhat do you think? Drop a comment below!\n\n#${brand.industry.toLowerCase()} #innovation`;
      hashtags = [`#${brand.industry.toLowerCase()}`, '#innovation', '#content'];
    }

    items.push({
      id: `content-${Date.now()}-${i}`,
      brandId: brand.id,
      ideaId: idea.id,
      type: 'caption',
      title: `Caption: ${idea.topic}`,
      text: content,
      hashtags,
      status: 'draft',
      createdAt: new Date(),
    });
  }

  return items;
}

export async function genPosts(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 3 } = options;
  const items: ContentItem[] = [];

  const llmProvider = llmProviders.openrouter.isReady(config) 
    ? llmProviders.openrouter 
    : llmProviders.huggingface.isReady(config) 
    ? llmProviders.huggingface 
    : null;

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    let content = '';

    if (llmProvider) {
      try {
        const prompt = `Write a comprehensive social media post for a ${brand.industry} brand.
        
        Brand: ${brand.name}
        Tone: ${brand.toneOfVoice}
        Target Audience: ${brand.targetAudience}
        Topic: ${idea.topic}
        Angle: ${idea.angle}
        Keywords: ${idea.keywords.join(', ')}
        
        Requirements:
        - 400-800 words
        - Engaging introduction
        - Valuable insights or tips
        - Personal touch when appropriate
        - Strong call to action
        - Professional ${brand.toneOfVoice} tone
        
        Structure the post with clear sections and make it highly engaging.`;

        const response = await llmProvider.run({ prompt, maxTokens: 1000 }, config);
        content = response.trim();
        
        useTelemetryStore.getState().incrementUsage(brand.id, llmProvider.name);
      } catch (error) {
        console.warn('LLM post generation failed:', error);
      }
    }

    // Fallback template
    if (!content) {
      content = `${idea.angle}

Here's what you need to know about ${idea.topic}:

🔹 ${idea.keywords[0]} is becoming increasingly important
🔹 ${brand.targetAudience} are looking for innovative solutions
🔹 The future of ${brand.industry} depends on adaptation

At ${brand.name}, we're committed to helping you stay ahead of the curve.

What's your experience with ${idea.topic}? Share your thoughts in the comments!

#${brand.industry.toLowerCase()} #innovation #future`;
    }

    items.push({
      id: `content-${Date.now()}-${i}`,
      brandId: brand.id,
      ideaId: idea.id,
      type: 'post',
      title: `Post: ${idea.topic}`,
      text: content,
      hashtags: [`#${brand.industry.toLowerCase()}`, '#innovation'],
      status: 'draft',
      createdAt: new Date(),
    });
  }

  return items;
}

export async function genBlogs(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 2, wordCount = 1000 } = options;
  const items: ContentItem[] = [];

  const llmProvider = llmProviders.openrouter.isReady(config) 
    ? llmProviders.openrouter 
    : llmProviders.huggingface.isReady(config) 
    ? llmProviders.huggingface 
    : null;

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    let content = '';

    if (llmProvider) {
      try {
        const prompt = `Write a comprehensive blog post for a ${brand.industry} brand.
        
        Brand: ${brand.name}
        Tone: ${brand.toneOfVoice}
        Target Audience: ${brand.targetAudience}
        Topic: ${idea.topic}
        Angle: ${idea.angle}
        Keywords: ${idea.keywords.join(', ')}
        Target Length: ${wordCount} words
        
        Requirements:
        - SEO-optimized title
        - Engaging introduction
        - Well-structured content with subheadings
        - Actionable insights
        - Conclusion with call to action
        - Professional but engaging tone
        
        Include relevant examples and make it valuable for the target audience.`;

        const response = await llmProvider.run({ prompt, maxTokens: Math.floor(wordCount * 1.5) }, config);
        content = response.trim();
        
        useTelemetryStore.getState().incrementUsage(brand.id, llmProvider.name);
      } catch (error) {
        console.warn('LLM blog generation failed:', error);
      }
    }

    // Fallback template
    if (!content) {
      content = `# ${idea.angle}

## Introduction

In today's rapidly evolving ${brand.industry} landscape, understanding ${idea.topic} is crucial for success. This comprehensive guide will help ${brand.targetAudience} navigate the complexities and opportunities ahead.

## Key Insights

### 1. ${idea.keywords[0]}
Understanding the fundamentals is essential for any successful strategy.

### 2. ${idea.keywords[1] || 'Innovation'}
Staying ahead of trends requires continuous learning and adaptation.

### 3. ${idea.keywords[2] || 'Implementation'}
Practical application of knowledge is where real value is created.

## Conclusion

${idea.topic} represents both a challenge and an opportunity for ${brand.targetAudience}. By focusing on ${idea.keywords.join(', ')}, you can position yourself for success in the evolving ${brand.industry} landscape.

Ready to take the next step? Contact ${brand.name} to learn how we can help you achieve your goals.`;
    }

    items.push({
      id: `content-${Date.now()}-${i}`,
      brandId: brand.id,
      ideaId: idea.id,
      type: 'blog',
      title: idea.angle,
      text: content,
      metadata: { 
        wordCount: content.split(' ').length,
        estimatedReadTime: Math.ceil(content.split(' ').length / 200),
      },
      status: 'draft',
      createdAt: new Date(),
    });
  }

  return items;
}

export async function genImages(options: GenerateOptions, config: ProviderConfig): Promise<ContentItem[]> {
  const { brand, ideas, count = 4 } = options;
  const items: ContentItem[] = [];

  const imageProvider = imageProviders.huggingface.isReady(config)
    ? imageProviders.huggingface
    : imageProviders.unsplash.isReady(config)
    ? imageProviders.unsplash
    : null;

  for (let i = 0; i < Math.min(count, ideas.length); i++) {
    const idea = ideas[i];
    let assets: AssetRef[] = [];

    if (imageProvider) {
      try {
        const prompt = `${idea.topic}, ${brand.industry}, ${idea.keywords.join(', ')}, professional, high quality`;
        const results = await imageProvider.run({ prompt, count: 1 }, config);
        assets = results;
        
        useTelemetryStore.getState().incrementUsage(brand.id, imageProvider.name);
      } catch (error) {
        console.warn('Image generation failed:', error);
      }
    }

    // Fallback: prompt for manual creation
    if (assets.length === 0) {
      assets = [{
        kind: 'img',
        prompt: `Create an image about: ${idea.topic}. Keywords: ${idea.keywords.join(', ')}. Style: Professional, ${brand.industry}, high quality`,
        meta: { provider: 'manual', suggested: true },
      }];
    }

    items.push({
      id: `content-${Date.now()}-${i}`,
      brandId: brand.id,
      ideaId: idea.id,
      type: 'image',
      title: `Image: ${idea.topic}`,
      text: idea.angle,
      assets,
      status: 'draft',
      createdAt: new Date(),
    });
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
    // Get brand and ideas (in real app, fetch from stores)
    const brand: Brand = {
      id: brandId,
      name: 'Example Brand',
      description: 'A sample brand for testing',
      industry: 'Technology',
      targetAudience: 'Tech professionals',
      toneOfVoice: 'Professional and approachable',
      keywords: ['innovation', 'technology', 'solutions'],
      brandColors: ['#007bff'],
      socialHandles: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
    ];

    const options: GenerateOptions = { brand, ideas, count };

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