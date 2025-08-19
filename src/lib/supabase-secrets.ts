import { supabase } from '@/integrations/supabase/client';

export interface SecretKey {
  name: string;
  value: string;
}

export async function saveSecretToSupabase(name: string, value: string): Promise<boolean> {
  try {
    // Call edge function to save secret
    const { data, error } = await supabase.functions.invoke('save-secret', {
      method: 'POST',
      body: { name, value }
    });
    
    if (error) {
      console.error('Failed to save secret:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving secret:', error);
    return false;
  }
}

export async function testApiKey(provider: string, apiKey: string): Promise<{ ok: boolean; message: string }> {
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
      case 'tavily':
        testResult = await testTavily(apiKey);
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

async function testTavily(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query: 'test', max_results: 1 })
    });
    
    if (response.ok) {
      return { ok: true, message: 'Tavily API key is valid' };
    } else {
      return { ok: false, message: 'Invalid Tavily API key' };
    }
  } catch {
    return { ok: false, message: 'Failed to test Tavily API key' };
  }
}