"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { householdSchema } from "@/lib/validations/household";

export type SaveState = { ok: true } | { ok: false; error: string };

/**
 * Enregistre (upsert) le profil ménage de l'utilisateur connecté.
 * Scoping systématique par `user_id` (en plus de la RLS) — défense en profondeur.
 */
export async function saveHousehold(input: unknown): Promise<SaveState> {
  const parsed = householdSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }

  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    ...parsed.data,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase
        .from("households")
        .update(payload)
        .eq("id", existing.id)
        .eq("user_id", user.id)
    : await supabase.from("households").insert(payload);

  if (error) {
    return { ok: false, error: "Échec de l'enregistrement. Réessayez." };
  }

  revalidatePath("/profil-menage");
  revalidatePath("/dashboard");
  return { ok: true };
}
