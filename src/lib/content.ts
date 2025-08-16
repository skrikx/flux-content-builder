import { invokeWithAuth } from "@/lib/invoke";
import { ContentItem } from "@/types";

export async function getContent(brandId?: string, type?: string): Promise<ContentItem[]> {
  const params = new URLSearchParams();
  if (brandId) params.append('brand_id', brandId);
  if (type) params.append('type', type);
  
  const { data, error } = await invokeWithAuth("content", {
    method: "GET",
    ...(params.toString() && { body: { query: params.toString() } })
  });
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getContentById(id: string): Promise<ContentItem> {
  const { data, error } = await invokeWithAuth(`content/${id}`, {
    method: "GET"
  });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  const { data, error } = await invokeWithAuth(`content/${id}`, {
    method: "PUT",
    body: updates
  });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await invokeWithAuth(`content/${id}`, {
    method: "DELETE"
  });
  
  if (error) throw new Error(error.message);
}