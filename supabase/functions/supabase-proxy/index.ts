import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-target-path, x-target-method, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, prefer, range, x-upsert',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Expose-Headers': 'content-range, x-total-count, content-type, apikey',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const targetPath = req.headers.get('x-target-path');
    if (!targetPath) {
      return new Response(
        JSON.stringify({ error: 'Missing x-target-path header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the target path is within our Supabase instance
    const allowedPrefixes = ['/rest/v1/', '/auth/v1/', '/storage/v1/', '/functions/v1/'];
    const isAllowed = allowedPrefixes.some(prefix => targetPath.startsWith(prefix));
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Invalid target path' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent recursive proxy calls
    if (targetPath.includes('/functions/v1/supabase-proxy')) {
      return new Response(
        JSON.stringify({ error: 'Recursive proxy not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUrl = `${SUPABASE_URL}${targetPath}`;
    const targetMethod = req.headers.get('x-target-method') || req.method;

    // Build headers for the upstream request
    const upstreamHeaders = new Headers();
    upstreamHeaders.set('apikey', SUPABASE_ANON_KEY);

    // Forward relevant headers
    const forwardHeaders = [
      'authorization', 'content-type', 'prefer', 'range',
      'x-client-info', 'x-upsert', 'accept',
      'x-supabase-client-platform', 'x-supabase-client-platform-version',
      'x-supabase-client-runtime', 'x-supabase-client-runtime-version',
    ];

    for (const header of forwardHeaders) {
      const value = req.headers.get(header);
      if (value) {
        upstreamHeaders.set(header, value);
      }
    }

    // Forward the request body for non-GET requests
    let body: BodyInit | null = null;
    if (targetMethod !== 'GET' && targetMethod !== 'HEAD') {
      body = await req.arrayBuffer();
      if ((body as ArrayBuffer).byteLength === 0) {
        body = null;
      }
    }

    // Make the upstream request
    const upstreamResponse = await fetch(targetUrl, {
      method: targetMethod,
      headers: upstreamHeaders,
      body,
    });

    // Build response headers
    const responseHeaders = new Headers(corsHeaders);
    const copyResponseHeaders = [
      'content-type', 'content-range', 'x-total-count',
      'content-disposition', 'cache-control',
    ];
    for (const header of copyResponseHeaders) {
      const value = upstreamResponse.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    const responseBody = await upstreamResponse.arrayBuffer();

    return new Response(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
