import { invokeWithAuth } from "@/lib/invoke";
import { ContentItem } from "@/types";

export async function getContent(brandId?: string, type?: string): Promise<ContentItem[]> {
  const params: Record<string, string> = {};
  if (brandId) params.brand_id = brandId;
  if (type) params.type = type;
  const { data, error } = await invokeWithAuth("content", { method: "GET", params });
  if (error) throw new Error(error.message);
  
  // Transform database format to frontend format
  const items = (data || []).map((item: any) => ({
    id: item.id,
    brandId: item.brand_id,
    type: item.data?.kind || item.type, // Use data.kind for content type, fallback to item.type
    title: item.title || `${item.data?.kind || item.type} content`,
    text: item.data?.markdown || item.data?.content || item.data?.text,
    content: item.data?.markdown || item.data?.content || item.data?.text,
    data: item.data,
    status: item.status === 'ready' ? 'draft' : item.status, // Map database status to frontend
    createdAt: new Date(item.created_at),
  }));
  
  return items;
}

export async function updateContent(id: string, updates: Partial<ContentItem>) {
  const { data, error } = await invokeWithAuth("content", { method: "PUT", body: { id, updates } });
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await invokeWithAuth("content", { method: "DELETE", body: { id } });
  if (error) throw new Error(error.message);
}
