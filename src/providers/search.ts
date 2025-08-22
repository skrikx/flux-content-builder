import { Provider, ProviderConfig, ProviderTestResult, Ref } from '@/types';
import { fetchWithRetry, normalizeError } from './util.http';

export interface SearchOptions {
  query: string;
  limit?: number;
  source?: 'web' | 'news' | 'reddit';
}

interface TavilyResult {
  url: string;
  title: string;
  content: string;
}

interface RedditPost {
  data: {
    permalink: string;
    title: string;
    selftext?: string;
  };
}

export class TavilyProvider implements Provider {
  name = 'tavily';

  isReady(cfg: ProviderConfig): boolean {
    return !!cfg.keys.tavily;
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      if (!this.isReady(cfg)) {
        return { ok: false, message: 'API key not configured', at: new Date().toISOString() };
      }

      const response = await fetchWithRetry('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: cfg.keys.tavily,
          query: 'test',
          max_results: 1,
        }),
      });

      await response.json();
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'tavily');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: SearchOptions, cfg: ProviderConfig): Promise<Ref[]> {
    if (!this.isReady(cfg)) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response = await fetchWithRetry('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: cfg.keys.tavily,
          query: input.query,
          max_results: input.limit || 10,
          search_depth: 'basic',
          include_answer: false,
          include_raw_content: false,
        }),
      });

      const data = await response.json();
      
      return data.results?.map((result: TavilyResult) => ({
        url: result.url,
        title: result.title,
        source: 'web' as const,
        snippet: result.content,
      })) || [];
    } catch (error) {
      throw normalizeError(error, 'tavily');
    }
  }
}

export class DuckDuckGoProvider implements Provider {
  name = 'duckduckgo';

  isReady(cfg: ProviderConfig): boolean {
    return true; // No API key required
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      // Simple test search
      await this.run({ query: 'test', limit: 1 }, cfg);
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'duckduckgo');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: SearchOptions, cfg: ProviderConfig): Promise<Ref[]> {
    // Note: This is a simplified implementation
    // In production, you'd need a proxy server to handle DuckDuckGo searches
    // For now, return stub data
    return [
      {
        url: `https://example.com/search?q=${encodeURIComponent(input.query)}`,
        title: `Search results for: ${input.query}`,
        source: 'web' as const,
        snippet: 'DuckDuckGo search results would appear here. This is a placeholder implementation.',
      },
    ];
  }
}

export class RedditProvider implements Provider {
  name = 'reddit';

  isReady(cfg: ProviderConfig): boolean {
    return true; // Uses public JSON API
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      await this.run({ query: 'test', limit: 1 }, cfg);
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'reddit');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: SearchOptions, cfg: ProviderConfig): Promise<Ref[]> {
    try {
      const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(input.query)}&limit=${input.limit || 10}`;
      
      const response = await fetchWithRetry(searchUrl, {
        headers: {
          'User-Agent': 'FluxContent/1.0',
        },
      });

      const data = await response.json();
      
      return data.data?.children?.map((post: RedditPost) => ({
        url: `https://reddit.com${post.data.permalink}`,
        title: post.data.title,
        source: 'reddit' as const,
        snippet: post.data.selftext?.substring(0, 200) || '',
      })) || [];
    } catch (error) {
      throw normalizeError(error, 'reddit');
    }
  }
}

export const searchProviders = {
  tavily: new TavilyProvider(),
  duckduckgo: new DuckDuckGoProvider(),
  reddit: new RedditProvider(),
};