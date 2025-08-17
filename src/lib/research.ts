import { invokeWithAuth } from '@/lib/invoke';
import { Idea } from '@/types';

export async function runResearch(query: string, sources: Record<string, boolean>): Promise<Idea[]> {
  const enabled = Object.entries(sources).filter(([,v])=>v).map(([k])=>k);
  const { data, error } = await invokeWithAuth('research', { method: 'POST', body: { query, sources: enabled } });
  if (error) throw new Error(error.message);
  return (data?.ideas || []) as Idea[];
}
