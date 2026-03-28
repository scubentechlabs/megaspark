/**
 * Proxied Supabase client that routes all HTTP requests through the 
 * supabase-proxy edge function so the anon key never appears in 
 * browser network requests.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/supabase-proxy`;

const AUTH_STORAGE_KEY_PATTERN = /^sb-.*-auth-token$/;

function getDerivedAuthStorageKey() {
  try {
    const projectRef = new URL(SUPABASE_URL).host.split('.')[0];
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') return;

  const derivedKey = getDerivedAuthStorageKey();
  const storageKeys = new Set<string>();

  if (derivedKey) {
    storageKeys.add(derivedKey);
  }

  for (const key of Object.keys(window.localStorage)) {
    if (AUTH_STORAGE_KEY_PATTERN.test(key)) {
      storageKeys.add(key);
    }
  }

  for (const key of Object.keys(window.sessionStorage)) {
    if (AUTH_STORAGE_KEY_PATTERN.test(key)) {
      storageKeys.add(key);
    }
  }

  storageKeys.forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}

/**
 * Custom fetch that intercepts Supabase HTTP requests and routes them
 * through the proxy edge function. The apikey header is stripped from
 * outgoing requests — the proxy adds it server-side.
 *
 * WebSocket/Realtime connections are NOT proxied.
 */
const proxiedFetch: typeof globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string'
    ? input
    : input instanceof Request
      ? input.url
      : String(input);

  // Only proxy requests destined for our Supabase instance
  if (!url.startsWith(SUPABASE_URL)) {
    return globalThis.fetch(input, init);
  }

  // Don't proxy the proxy itself or realtime connections
  if (
    url.includes('/functions/v1/supabase-proxy') ||
    url.includes('/realtime/')
  ) {
    return globalThis.fetch(input, init);
  }

  const targetPath = url.slice(SUPABASE_URL.length);

  // Build new headers, stripping the apikey
  const originalHeaders = new Headers(init?.headers);
  const newHeaders = new Headers();

  originalHeaders.forEach((value, key) => {
    if (key.toLowerCase() !== 'apikey') {
      newHeaders.set(key, value);
    }
  });

  // Tell the proxy where to forward
  newHeaders.set('x-target-path', targetPath);
  newHeaders.set('x-target-method', init?.method || 'GET');

  return globalThis.fetch(PROXY_URL, {
    method: 'POST',
    headers: newHeaders,
    body: init?.body,
    signal: init?.signal,
    // @ts-ignore – duplex needed for streaming request bodies
    duplex: init?.body ? 'half' : undefined,
  });
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: proxiedFetch,
  },
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});


export async function forceLocalSignOut() {
  let signOutError: Error | null = null;

  const { error } = await supabase.auth.signOut({ scope: 'local' });
  clearStoredAuthSession();

  if (error && !/session not found/i.test(error.message)) {
    signOutError = error;
  }

  if (signOutError) {
    throw signOutError;
  }
}
