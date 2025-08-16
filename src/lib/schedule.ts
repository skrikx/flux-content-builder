import { invokeWithAuth } from "@/lib/invoke"

export async function createSchedule(contentId: string, platform: "buffer" | "webhook", whenISO: string, meta?: any) {
  const { data, error } = await invokeWithAuth("schedule", {
    method: "POST",
    body: { content_id: contentId, platform, publish_time: whenISO, meta }
  })
  if (error) throw new Error(error.message)
  return data
}

export async function listSchedules() {
  const { data, error } = await invokeWithAuth("schedule", { method: "GET" })
  if (error) throw new Error(error.message)
  return data
}