let logged = false;

export function logSupabaseConfig() {
  if (logged) return;
  logged = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ok = Boolean(url && key);

  if (ok) {
    const masked = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : "";
    console.log("[supabase] configured", { url, key: masked });
  } else {
    console.warn("[supabase] missing env vars", {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(key),
    });
  }
}
