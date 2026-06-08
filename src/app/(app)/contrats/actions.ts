"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contractSchema, normalizeCosts } from "@/lib/validations/contract";

export type ContractState = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function saveContract(
  input: unknown,
  contractId?: string,
): Promise<ContractState> {
  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Session expirée. Reconnectez-vous." };

  const { monthly_cost, annual_cost } = normalizeCosts(parsed.data);
  const payload = {
    user_id: user.id,
    category: parsed.data.category,
    provider_name: parsed.data.provider_name,
    offer_name: parsed.data.offer_name ?? null,
    monthly_cost,
    annual_cost,
    renewal_date: parsed.data.renewal_date ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = contractId
    ? await supabase
        .from("contracts")
        .update(payload)
        .eq("id", contractId)
        .eq("user_id", user.id)
    : await supabase.from("contracts").insert(payload);

  if (error) return { ok: false, error: "Échec de l'enregistrement." };

  revalidatePath("/contrats");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteContract(contractId: string): Promise<ContractState> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { error } = await supabase
    .from("contracts")
    .delete()
    .eq("id", contractId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Échec de la suppression." };

  revalidatePath("/contrats");
  return { ok: true };
}
