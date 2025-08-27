import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, getUserFromToken, supabaseAuthed } from "../_auth_util.ts";

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

    const supabase = supabaseAuthed(token);

    if (req.method === 'GET') {
      // Get user's provider keys
      const { data, error } = await supabase
        .from('provider_keys')
        .select('keys')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching provider keys:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch keys' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ keys: data?.keys || {} }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      // Save user's provider keys
      const { keys } = await req.json();
      
      if (!keys || typeof keys !== 'object') {
        return new Response(
          JSON.stringify({ error: 'Keys object is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('provider_keys')
        .upsert({ 
          user_id: user.id, 
          keys: keys 
        });

      if (error) {
        console.error('Error saving provider keys:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save keys' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in provider-keys function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});