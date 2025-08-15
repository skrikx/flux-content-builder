import { Provider, ProviderConfig, ProviderTestResult } from '@/types';
import { fetchWithRetry, normalizeError } from './util.http';

export interface LLMOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class OpenRouterProvider implements Provider {
  name = 'openrouter';

  isReady(cfg: ProviderConfig): boolean {
    return !!cfg.keys.openrouter;
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      if (!this.isReady(cfg)) {
        return { ok: false, message: 'API key not configured', at: new Date().toISOString() };
      }

      const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.keys.openrouter}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'FluxContent',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 10,
        }),
      });

      await response.json();
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'openrouter');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: LLMOptions, cfg: ProviderConfig): Promise<string> {
    if (!this.isReady(cfg)) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.keys.openrouter}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'FluxContent',
        },
        body: JSON.stringify({
          model: input.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: input.prompt }],
          max_tokens: input.maxTokens || 1000,
          temperature: input.temperature || 0.7,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw normalizeError(error, 'openrouter');
    }
  }
}

export class HuggingFaceProvider implements Provider {
  name = 'huggingface';

  isReady(cfg: ProviderConfig): boolean {
    return !!cfg.keys.hf;
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      if (!this.isReady(cfg)) {
        return { ok: false, message: 'API key not configured', at: new Date().toISOString() };
      }

      const response = await fetchWithRetry('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.keys.hf}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Test',
          options: { wait_for_model: true },
        }),
      });

      await response.json();
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'huggingface');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: LLMOptions, cfg: ProviderConfig): Promise<string> {
    if (!this.isReady(cfg)) {
      throw new Error('HuggingFace API key not configured');
    }

    try {
      const model = input.model || 'microsoft/DialoGPT-medium';
      const response = await fetchWithRetry(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.keys.hf}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: input.prompt,
          options: { wait_for_model: true },
          parameters: {
            max_length: input.maxTokens || 1000,
            temperature: input.temperature || 0.7,
          },
        }),
      });

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.replace(input.prompt, '').trim();
      }
      
      return data.generated_text || '';
    } catch (error) {
      throw normalizeError(error, 'huggingface');
    }
  }
}

export const llmProviders = {
  openrouter: new OpenRouterProvider(),
  huggingface: new HuggingFaceProvider(),
};