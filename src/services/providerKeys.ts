import { supabase } from '@/integrations/supabase/client';

export interface ProviderKeys {
  openai?: string;
  huggingface?: string;
  replicate?: string;
  pexels?: string;
  pixabay?: string;
  unsplash?: string;
  tavily?: string;
}

export async function getProviderKeys(): Promise<ProviderKeys> {
  try {
    const { data, error } = await supabase.functions.invoke('provider-keys', {
      method: 'GET'
    });
    
    if (error) {
      console.error('Failed to get provider keys:', error);
      return {};
    }
    
    return data?.keys || {};
  } catch (error) {
    console.error('Error getting provider keys:', error);
    return {};
  }
}

export async function saveProviderKeys(keys: ProviderKeys): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('provider-keys', {
      method: 'POST',
      body: { keys }
    });
    
    if (error) {
      console.error('Failed to save provider keys:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving provider keys:', error);
    return false;
  }
}

export async function testProviderKey(provider: string, apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    let testResult = { ok: false, message: 'Unknown provider' };
    
    switch (provider) {
      case 'openai':
        testResult = await testOpenAI(apiKey);
        break;
      case 'huggingface':
        testResult = await testHuggingFace(apiKey);
        break;
      case 'unsplash':
        testResult = await testUnsplash(apiKey);
        break;
      case 'replicate':
        testResult = await testReplicate(apiKey);
        break;
      case 'pexels':
        testResult = await testPexels(apiKey);
        break;
      case 'pixabay':
        testResult = await testPixabay(apiKey);
        break;
    }
    
    return testResult;
  } catch (error) {
    return { ok: false, message: 'Test failed with error' };
  }
}

async function testOpenAI(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (response.ok) {
      return { ok: true, message: 'OpenAI API key is valid' };
    } else {
      return { ok: false, message: 'Invalid OpenAI API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test OpenAI API key' };
  }
}

async function testHuggingFace(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch('https://huggingface.co/api/whoami', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (response.ok) {
      return { ok: true, message: 'HuggingFace API key is valid' };
    } else {
      return { ok: false, message: 'Invalid HuggingFace API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test HuggingFace API key' };
  }
}

async function testUnsplash(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`https://api.unsplash.com/me`, {
      headers: { 'Authorization': `Client-ID ${apiKey}` }
    });
    
    if (response.ok) {
      return { ok: true, message: 'Unsplash API key is valid' };
    } else {
      return { ok: false, message: 'Invalid Unsplash API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test Unsplash API key' };
  }
}

async function testReplicate(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    
    if (response.ok) {
      return { ok: true, message: 'Replicate API key is valid' };
    } else {
      return { ok: false, message: 'Invalid Replicate API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test Replicate API key' };
  }
}

async function testPexels(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch('https://api.pexels.com/v1/search?query=test&per_page=1', {
      headers: { 'Authorization': apiKey }
    });
    
    if (response.ok) {
      return { ok: true, message: 'Pexels API key is valid' };
    } else {
      return { ok: false, message: 'Invalid Pexels API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test Pexels API key' };
  }
}

async function testPixabay(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=test&per_page=3`);
    
    if (response.ok) {
      return { ok: true, message: 'Pixabay API key is valid' };
    } else {
      return { ok: false, message: 'Invalid Pixabay API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test Pixabay API key' };
  }
}