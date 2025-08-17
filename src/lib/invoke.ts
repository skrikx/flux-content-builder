import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type InvokeOptions = { method?: HTTPMethod; params?: Record<string, string|number|boolean|undefined>; body?: any; headers?: Record<string, string>; };

export async function invokeWithAuth(name: string, options: InvokeOptions = {}) {
  const method: HTTPMethod = options.method || 'POST';
  const { data: { session } } = await supabase.auth.getSession();
  const jwt = session?.access_token;

  const qs = options.params ? '?' + new URLSearchParams(Object.entries(options.params).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>[k,String(v)])).toString() : '';

  const url = `${SUPABASE_URL}/functions/v1/${name}${qs}`;
  const headers: Record<string,string> = { 'Content-Type':'application/json', ...(options.headers||{}), ...(jwt?{Authorization:`Bearer ${jwt}`}:{}) };

  const res = await fetch(url, { method, headers, body: method==='GET'||method==='HEAD' ? undefined : JSON.stringify(options.body||{}) });
  let data:any = null; try{ data = await res.json(); }catch{}
  if(!res.ok){ return { data:null, error:{ message:(data && (data.error||data.message)) || res.statusText, status: res.status } }; }
  return { data, error:null };
}
