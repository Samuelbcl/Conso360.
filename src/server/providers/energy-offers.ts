import { createClient } from "@/lib/supabase/server";
import type { OfferInput } from "@/server/comparison";

export interface EnergyOffersResult {
  offers: OfferInput[];
  hasExample: boolean;
}

/** Charge les offres énergie actives + nom du fournisseur, prêtes pour le moteur. */
export async function getEnergyOffers(): Promise<EnergyOffersResult> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("id, provider_id, name, price_structure, is_example, providers(name)")
    .eq("category", "energy")
    .eq("active", true);

  const rows = data ?? [];
  const offers: OfferInput[] = rows.map((o) => {
    const prov = Array.isArray(o.providers) ? o.providers[0] : o.providers;
    return {
      id: o.id,
      providerId: o.provider_id,
      providerName: prov?.name ?? "—",
      name: o.name,
      priceStructure: (o.price_structure ?? {}) as Record<string, number | string>,
    };
  });

  return { offers, hasExample: rows.some((o) => o.is_example) };
}
