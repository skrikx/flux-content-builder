import { Provider, ProviderConfig, ProviderTestResult, AssetRef } from '@/types';
import { fetchWithRetry, normalizeError } from './util.http';

export interface ImageOptions {
  prompt: string;
  count?: number;
  size?: string;
}

export class HuggingFaceImageProvider implements Provider {
  name = 'huggingface-image';

  isReady(cfg: ProviderConfig): boolean {
    return !!cfg.keys.hf;
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      if (!this.isReady(cfg)) {
        return { ok: false, message: 'API key not configured', at: new Date().toISOString() };
      }

      // Test with a simple prompt
      await this.run({ prompt: 'test image', count: 1 }, cfg);
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'huggingface-image');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: ImageOptions, cfg: ProviderConfig): Promise<AssetRef[]> {
    if (!this.isReady(cfg)) {
      throw new Error('HuggingFace API key not configured');
    }

    try {
      const response = await fetchWithRetry('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfg.keys.hf}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: input.prompt,
          options: { wait_for_model: true },
        }),
      });

      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve([{
            kind: 'img',
            b64: base64,
            prompt: input.prompt,
            meta: { provider: 'huggingface', model: 'stable-diffusion-xl' },
          }]);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw normalizeError(error, 'huggingface-image');
    }
  }
}

interface UnsplashPhoto {
  urls: {
    regular: string;
  };
  alt_description?: string;
  user: {
    name: string;
  };
  width: number;
  height: number;
}

export class UnsplashProvider implements Provider {
  name = 'unsplash';

  isReady(cfg: ProviderConfig): boolean {
    return !!cfg.keys.unsplash;
  }

  async test(cfg: ProviderConfig): Promise<ProviderTestResult> {
    try {
      if (!this.isReady(cfg)) {
        return { ok: false, message: 'API key not configured', at: new Date().toISOString() };
      }

      const response = await fetchWithRetry('https://api.unsplash.com/photos/random?count=1', {
        headers: {
          'Authorization': `Client-ID ${cfg.keys.unsplash}`,
        },
      });

      await response.json();
      return { ok: true, message: 'Connection successful', at: new Date().toISOString() };
    } catch (error) {
      const normalizedError = normalizeError(error, 'unsplash');
      return { ok: false, message: normalizedError.message, at: new Date().toISOString() };
    }
  }

  async run(input: ImageOptions, cfg: ProviderConfig): Promise<AssetRef[]> {
    if (!this.isReady(cfg)) {
      throw new Error('Unsplash API key not configured');
    }

    try {
      const response = await fetchWithRetry(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(input.prompt)}&per_page=${input.count || 4}`, {
        headers: {
          'Authorization': `Client-ID ${cfg.keys.unsplash}`,
        },
      });

      const data = await response.json();
      
      return data.results?.map((photo: UnsplashPhoto) => ({
        kind: 'img' as const,
        url: photo.urls.regular,
        prompt: input.prompt,
        meta: {
          provider: 'unsplash',
          alt: photo.alt_description,
          author: photo.user.name,
          width: photo.width,
          height: photo.height,
        },
      })) || [];
    } catch (error) {
      throw normalizeError(error, 'unsplash');
    }
  }
}

export const imageProviders = {
  huggingface: new HuggingFaceImageProvider(),
  unsplash: new UnsplashProvider(),
};