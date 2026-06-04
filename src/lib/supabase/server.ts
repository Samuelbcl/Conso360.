import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase pour le serveur (Server Components, Server Actions, Route Handlers).
 * Lit/écrit la session via les cookies Next.js.
 *
 * Note : dans un Server Component pur, l'écriture de cookies (setAll) lève une
 * erreur — on l'ignore. Le rafraîchissement de session est assuré par le
 * middleware (voir src/lib/supabase/middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : ignoré (le middleware rafraîchit).
          }
        },
      },
    },
  );
}
