import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 : la convention « middleware » est devenue « proxy ».
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les requêtes sauf :
     * - _next/static, _next/image (assets build)
     * - favicon, fichiers images/polices
     * - api/stripe/webhook (a besoin du corps brut, pas de session)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
