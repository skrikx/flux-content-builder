export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public provider?: string,
    public hint?: string
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 20000,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function normalizeError(error: unknown, provider?: string): FetchError {
  if (error instanceof FetchError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new FetchError('Request timeout', undefined, provider, 'Try again or check connection');
    }
    return new FetchError(error.message, undefined, provider);
  }

  return new FetchError('Unknown error occurred', undefined, provider);
}