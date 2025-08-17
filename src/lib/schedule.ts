import { invokeWithAuth } from '@/lib/invoke';

export async function listSchedules(brandId?: string) {
  const { data, error } = await invokeWithAuth('schedule', { method: 'GET', params: brandId ? { brand_id: brandId } : undefined });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createSchedule(contentId: string, brandId: string, publishAtISO: string) {
  const { data, error } = await invokeWithAuth('schedule', { method: 'POST', body: { content_id: contentId, brand_id: brandId, publish_at: publishAtISO } });
  if (error) throw new Error(error.message);
  return data;
}
