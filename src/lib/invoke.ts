import { supabase } from "@/integrations/supabase/client";

export async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  const jwt = session?.access_token;
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

export async function invokeWithAuth(name: string, options: any = {}) {
  const headers = await authHeader();
  return supabase.functions.invoke(name, { 
    ...options, 
    headers: { ...(options.headers || {}), ...headers } 
  });
}