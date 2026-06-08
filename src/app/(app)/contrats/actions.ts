"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contractSchema, normalizeCosts } from "@/lib/validations/contract";
import { compareEnergy, type HouseholdProfile } from "@/server/comparison";
import { getEnergyOffers } from "@/server/providers/energy-offers";
import type { Contract, Household } from "@/types/database";

export type ContractState = { ok: true } | { ok: false; error: string };

export type CompareState =
  | { ok: true; savingsAnnual: number | null; bestProvider: string | null }
  | { ok: false; error: string };

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

/**
 * Compare un contrat au marché (moteur énergie) et persiste le résultat
 * dans `comparisons`. Réutilise le profil ménage pour la conso.
 */
export async function compareContract(contractId: string): Promise<CompareState> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("user_id", user.id)
    .maybeSingle<Contract>();
  if (!contract) return { ok: false, error: "Contrat introuvable." };

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Household>();

  const { offers } = await getEnergyOffers();
  if (offers.length === 0) {
    return { ok: false, error: "Aucune offre de marché disponible." };
  }

  const profile: HouseholdProfile = {
    householdSize: household?.household_size ?? undefined,
    housingType: household?.housing_type ?? undefined,
    region: household?.region ?? undefined,
    hasEv: household?.has_ev ?? undefined,
    elecConsumptionKwh: household?.elec_consumption_kwh ?? undefined,
    gasConsumptionKwh: household?.gas_consumption_kwh ?? undefined,
  };

  const result = compareEnergy(profile, offers, {
    currentCostAnnual: contract.annual_cost ?? undefined,
  });

  const { error } = await supabase.from("comparisons").insert({
    user_id: user.id,
    household_id: household?.id ?? null,
    category: "energy",
    current_cost_annual: contract.annual_cost,
    best_offer_id: result.best?.offerId ?? null,
    best_cost_annual: result.best?.annualCost ?? null,
    savings_annual: result.savingsAnnual,
    roi_months: result.roiMonths,
    result,
  });
  if (error) return { ok: false, error: "Échec de l'enregistrement de la comparaison." };

  revalidatePath("/contrats");
  revalidatePath("/dashboard");
  return {
    ok: true,
    savingsAnnual: result.savingsAnnual,
    bestProvider: result.best?.providerName ?? null,
  };
}
