import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, getUserFromToken } from "../_auth_util.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Idea = { id: string; brandId?: string; topic: string; angle: string; keywords: string[]; confidence: number; references: any[]; createdAt?: string };

function normalizeIdeas(query: string, docs: any[]): Idea[] {
  return docs.slice(0, 12).map((d, i) => ({
    id: crypto.randomUUID(),
    topic: d.title || d.heading || d.topic || query,
    angle: d.snippet || d.summary || d.text || query,
    keywords: (d.keywords || []).slice(0,8),
    confidence: 0.7,
    references: [ { url: d.url, source: d.source } ],
    createdAt: new Date().toISOString()
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type":"application/json" } });

    const body = await req.json().catch(()=>({}));
    const query: string = body?.query || '';
    const sources: string[] = body?.sources || ['tavily','reddit','hn','wikipedia'];
    if (!query.trim()) return new Response(JSON.stringify({ ideas: [] }), { headers: { ...corsHeaders, "Content-Type":"application/json" } });

    const tasks: Promise<any>[] = [];

    // Tavily (if key present)
    const tavKey = Deno.env.get('TAVILY_API_KEY');
    if (sources.includes('tavily') && tavKey) {
      tasks.push(fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tavKey, query, search_depth: 'advanced', include_answer: false, include_images: false, max_results: 5 })
      }).then(r=>r.json()).then((j)=> (j?.results || []).map((r:any)=>({ title:r.title, snippet:r.content, url:r.url, source:'tavily'}))).catch(()=>[]));
    }

    // Reddit JSON (no key)
    if (sources.includes('reddit')) {
      tasks.push(fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&t=year&limit=10`, { headers: { 'User-Agent':'flux-content/1.0' } })
        .then(r=>r.json()).then((j)=> (j.data?.children || []).map((c:any)=>({ title:c.data?.title, snippet:c.data?.selftext||c.data?.title, url:`https://reddit.com${c.data?.permalink}`, source:'reddit'}))).catch(()=>[]));
    }

    // HackerNews (Algolia) (no key)
    if (sources.includes('hn')) {
      tasks.push(fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story`)
        .then(r=>r.json()).then((j)=> (j.hits || []).map((h:any)=>({ title:h.title, snippet:h._highlightResult?.title?.value || h.title, url:h.url||`https://news.ycombinator.com/item?id=${h.objectID}`, source:'hn'}))).catch(()=>[]));
    }

    // Wikipedia (no key)
    if (sources.includes('wikipedia')) {
      tasks.push(fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`)
        .then(r=>r.json()).then((j)=> (j.query?.search || []).map((s:any)=>({ title:s.title, snippet:s.snippet?.replace(/<[^>]+>/g,''), url:`https://en.wikipedia.org/wiki/${encodeURIComponent(s.title)}`, source:'wikipedia'}))).catch(()=>[]));
    }

    const results = (await Promise.all(tasks)).flat();
    const ideas = normalizeIdeas(query, results);
    return new Response(JSON.stringify({ ideas }), { headers: { ...corsHeaders, "Content-Type":"application/json" } });
  } catch (e) {
    console.error('research() error', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" } });
  }
});
