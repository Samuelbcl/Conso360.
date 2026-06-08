"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { compareEnergy, type HouseholdProfile } from "@/server/comparison";
import { getEnergyOffers } from "@/server/providers/energy-offers";
import type { AlertStatus, Contract, Household } from "@/types/database";

/** Seuil minimal d'économie (€/an) pour déclencher une alerte. */
const SAVINGS_THRESHOLD = 50;

export type AlertCheckState =
  | { ok: true; created: number }
  | { ok: false; error: string };

/**
 * Scanne les contrats énergie de l'utilisateur, compare au marché et crée
 * une alerte par contrat dont l'économie dépasse le seuil (dédupliquée par
 * meilleure offre tant qu'une alerte 'new' existe déjà).
 */
export async function checkEnergyAlerts(): Promise<AlertCheckState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", "energy")
    .returns<Contract[]>();

  const energyContracts = (contracts ?? []).filter((c) => c.annual_cost !== null);
  if (energyContracts.length === 0) return { ok: true, created: 0 };

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Household>();

  const { offers } = await getEnergyOffers();
  if (offers.length === 0) return { ok: true, created: 0 };

  const profile: HouseholdProfile = {
    householdSize: household?.household_size ?? undefined,
    housingType: household?.housing_type ?? undefined,
    region: household?.region ?? undefined,
    hasEv: household?.has_ev ?? undefined,
    elecConsumptionKwh: household?.elec_consumption_kwh ?? undefined,
    gasConsumptionKwh: household?.gas_consumption_kwh ?? undefined,
  };

  const { data: existing } = await supabase
    .from("alerts")
    .select("offer_id")
    .eq("user_id", user.id)
    .eq("category", "energy")
    .eq("status", "new");
  const alerted = new Set((existing ?? []).map((a) => a.offer_id));

  const toInsert: {
    user_id: string;
    category: "energy";
    message: string;
    offer_id: string;
    status: AlertStatus;
  }[] = [];

  for (const c of energyContracts) {
    const r = compareEnergy(profile, offers, {
      currentCostAnnual: c.annual_cost ?? undefined,
    });
    if (
      r.best &&
      r.savingsAnnual !== null &&
      r.savingsAnnual > SAVINGS_THRESHOLD &&
      !alerted.has(r.best.offerId)
    ) {
      toInsert.push({
        user_id: user.id,
        category: "energy",
        message: `Économie possible de ${Math.round(r.savingsAnnual)} €/an : passez de ${c.provider_name} à ${r.best.providerName} — ${r.best.offerName}.`,
        offer_id: r.best.offerId,
        status: "new",
      });
      alerted.add(r.best.offerId);
    }
  }

  if (toInsert.length === 0) return { ok: true, created: 0 };

  const { error } = await supabase.from("alerts").insert(toInsert);
  if (error) return { ok: false, error: "Échec de la création des alertes." };

  revalidatePath("/alertes");
  revalidatePath("/dashboard");
  return { ok: true, created: toInsert.length };
}

export type AlertActionState = { ok: true } | { ok: false; error: string };

export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
): Promise<AlertActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { error } = await supabase
    .from("alerts")
    .update({ status })
    .eq("id", alertId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Échec." };
  revalidatePath("/alertes");
  return { ok: true };
}
