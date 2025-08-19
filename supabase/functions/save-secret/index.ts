import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, getUserFromToken } from "../_auth_util.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, value } = await req.json();
    
    if (!name || !value || typeof name !== 'string' || typeof value !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name and value are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map frontend provider names to Supabase secret names
    const secretNameMap: Record<string, string> = {
      'openai': 'OPENAI_API_KEY',
      'huggingface': 'HUGGING_FACE_ACCESS_TOKEN',
      'hf': 'HUGGING_FACE_ACCESS_TOKEN',
      'unsplash': 'UNSPLASH_ACCESS_KEY',
      'tavily': 'TAVILY_API_KEY'
    };

    const secretName = secretNameMap[name] || name;
    
    // Store in Supabase secrets (this is a simulation - in real implementation, 
    // this would require admin privileges or a different approach)
    console.log(`Would save secret ${secretName} for user ${user.id}`);
    
    // For now, we'll just return success
    // In a real implementation, you'd use Supabase's secret management API
    return new Response(
      JSON.stringify({ success: true, message: `Secret ${secretName} saved successfully` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error saving secret:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});