import { Brand, Idea, Ref, ProviderConfig } from '@/types';
import { searchProviders } from '@/providers/search';
import { llmProviders } from '@/providers/llm';
import { useTelemetryStore } from '@/store/telemetry';

export async function runCompetitorDiscovery(brand: Brand, config: ProviderConfig): Promise<Ref[]> {
  const queries = [
    `${brand.industry} best brands 2024`,
    `${brand.targetAudience} popular brands`,
    `site:instagram.com ${brand.industry}`,
    `site:tiktok.com ${brand.industry}`,
  ];

  const refs: Ref[] = [];
  
  // Try providers in order of preference
  const providers = [searchProviders.tavily, searchProviders.duckduckgo, searchProviders.reddit];
  
  for (const provider of providers) {
    if (provider.isReady(config)) {
      try {
        for (const query of queries) {
          const results = await provider.run({ query, limit: 5 }, config);
          refs.push(...results);
        }
        break; // Success with this provider
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        continue; // Try next provider
      }
    }
  }

  // If no providers worked, return stub data
  if (refs.length === 0) {
    return [
      {
        url: 'https://example.com/competitor-1',
        title: `Top ${brand.industry} Brands`,
        source: 'web',
        snippet: `Leading brands in the ${brand.industry} space that target ${brand.targetAudience}`,
      },
      {
        url: 'https://example.com/competitor-2',
        title: `${brand.industry} Market Leaders`,
        source: 'web',
        snippet: `Analysis of successful ${brand.industry} companies and their strategies`,
      },
    ];
  }

  return refs.slice(0, 10); // Limit results
}

export async function fetchPublicSignals(refs: Ref[]): Promise<Ref[]> {
  // Enrich refs with additional metadata
  // In a real implementation, this would fetch actual content
  return refs.map(ref => ({
    ...ref,
    snippet: ref.snippet || `Content analysis for ${ref.title}`,
  }));
}

export function topicCluster(refs: Ref[], brand: Brand): Array<{ topic: string; keywords: string[]; score: number }> {
  // Simple keyword extraction and clustering
  const allText = refs.map(ref => `${ref.title} ${ref.snippet}`).join(' ').toLowerCase();
  
  // Extract common terms
  const words = allText.match(/\b\w{4,}\b/g) || [];
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Get top keywords
  const topKeywords = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);

  // Create topic clusters
  const clusters = [
    {
      topic: `${brand.industry} Trends`,
      keywords: topKeywords.slice(0, 5),
      score: 0.9,
    },
    {
      topic: `${brand.targetAudience} Interests`,
      keywords: topKeywords.slice(5, 10),
      score: 0.8,
    },
    {
      topic: 'Content Opportunities',
      keywords: topKeywords.slice(10, 15),
      score: 0.7,
    },
  ];

  return clusters;
}

export async function hookSynthesis(
  clusters: Array<{ topic: string; keywords: string[]; score: number }>,
  brand: Brand,
  config: ProviderConfig
): Promise<Idea[]> {
  const ideas: Idea[] = [];

  // Try to use LLM for hook generation
  const llmProvider = llmProviders.openrouter.isReady(config) 
    ? llmProviders.openrouter 
    : llmProviders.huggingface.isReady(config) 
    ? llmProviders.huggingface 
    : null;

  for (const cluster of clusters) {
    if (llmProvider) {
      try {
        const prompt = `Generate 3 content angle ideas for a ${brand.industry} brand targeting ${brand.targetAudience}. 
        Brand tone: ${brand.toneOfVoice}
        Topic: ${cluster.topic}
        Keywords: ${cluster.keywords.join(', ')}
        
        Format each idea as:
        Angle: [specific angle]
        Hook: [compelling hook]
        
        Keep it concise and actionable.`;

        const response = await llmProvider.run({ prompt }, config);
        
        // Parse response into ideas
        const ideaMatches = response.match(/Angle: ([^\n]+)\s*Hook: ([^\n]+)/g) || [];
        
        ideaMatches.forEach((match, index) => {
          const [, angle, hook] = match.match(/Angle: ([^\n]+)\s*Hook: ([^\n]+)/) || [];
          if (angle && hook) {
            ideas.push({
              id: `idea-${Date.now()}-${index}`,
              brandId: brand.id,
              topic: cluster.topic,
              angle: angle.trim(),
              keywords: cluster.keywords,
              confidence: cluster.score,
              references: [],
              createdAt: new Date(),
            });
          }
        });
      } catch (error) {
        console.warn('LLM hook generation failed:', error);
        // Fall back to templates
      }
    }
    
    // Template-based fallback
    if (ideas.length === 0) {
      const templates = [
        `How ${brand.industry} is changing ${brand.targetAudience}'s daily life`,
        `5 secrets every ${brand.targetAudience} should know about ${cluster.topic}`,
        `Why ${brand.targetAudience} are switching to ${cluster.keywords[0]}`,
      ];

      templates.forEach((template, index) => {
        ideas.push({
          id: `idea-${Date.now()}-${index}`,
          brandId: brand.id,
          topic: cluster.topic,
          angle: template,
          keywords: cluster.keywords,
          confidence: cluster.score * 0.8, // Lower confidence for templates
          references: [],
          createdAt: new Date(),
        });
      });
    }
  }

  return ideas;
}

export async function researchPipeline(brandId: string, config: ProviderConfig): Promise<Idea[]> {
  const startTime = Date.now();
  
  try {
    // Get brand (in real app, fetch from store)
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

    // Step 1: Competitor discovery
    const refs = await runCompetitorDiscovery(brand, config);
    
    // Step 2: Enrich signals
    const enrichedRefs = await fetchPublicSignals(refs);
    
    // Step 3: Topic clustering
    const clusters = topicCluster(enrichedRefs, brand);
    
    // Step 4: Hook synthesis
    const ideas = await hookSynthesis(clusters, brand, config);

    // Record telemetry
    const duration = Date.now() - startTime;
    useTelemetryStore.getState().updateTiming(brandId, 'research', duration);

    return ideas;
  } catch (error) {
    console.error('Research pipeline failed:', error);
    
    // Return fallback ideas
    return [
      {
        id: `fallback-${Date.now()}`,
        brandId,
        topic: 'Content Ideas',
        angle: 'Share your expertise and build thought leadership',
        keywords: ['expertise', 'leadership', 'content'],
        confidence: 0.6,
        references: [],
        createdAt: new Date(),
      },
    ];
  }
}