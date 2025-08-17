import { invokeWithAuth } from "@/lib/invoke";
import { ContentItem } from "@/types";

export async function getContent(brandId?: string, type?: string): Promise<ContentItem[]> {
  const params: Record<string, string> = {};
  if (brandId) params.brand_id = brandId;
  if (type) params.type = type;
  const { data, error } = await invokeWithAuth("content", { method: "GET", params });
  if (error) throw new Error(error.message);
  return data || [];
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
