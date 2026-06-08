import type {
  CompareOptions,
  ComparisonResult,
  HouseholdProfile,
  OfferInput,
  OfferResult,
} from "./types";
import { estimateElecKwh, estimateGasKwh } from "./estimates";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Convertit une valeur JSON (number | string) en nombre fini, sinon undefined. */
function toNumber(v: unknown): number | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Coût annuel d'une offre énergie pour une conso donnée.
 *   coût = abonnement_annuel + elecKwh*prix_kwh_elec + gasKwh*prix_kwh_gaz
 * Renvoie null si l'offre est incomplète pour une conso > 0 (prix manquant)
 * → l'offre est écartée proprement, sans crash.
 */
export function energyOfferAnnualCost(
  offer: OfferInput,
  elecKwh: number,
  gasKwh: number,
): number | null {
  const ps = offer.priceStructure ?? {};
  const abo = toNumber(ps.abonnement_annuel) ?? 0;
  const priceElec = toNumber(ps.prix_kwh_elec);
  const priceGas = toNumber(ps.prix_kwh_gaz);

  if (elecKwh > 0 && priceElec === undefined) return null;
  if (gasKwh > 0 && priceGas === undefined) return null;

  const cost = abo + elecKwh * (priceElec ?? 0) + gasKwh * (priceGas ?? 0);
  return Number.isFinite(cost) ? round2(cost) : null;
}

/** Résout la conso à utiliser : valeurs du profil si présentes, sinon estimation. */
export function resolveEnergyConsumption(p: HouseholdProfile): {
  elecKwh: number;
  gasKwh: number;
  estimated: boolean;
} {
  const hasElec = p.elecConsumptionKwh !== undefined && p.elecConsumptionKwh !== null;
  const hasGas = p.gasConsumptionKwh !== undefined && p.gasConsumptionKwh !== null;
  return {
    elecKwh: hasElec ? p.elecConsumptionKwh! : estimateElecKwh(p),
    gasKwh: hasGas ? p.gasConsumptionKwh! : estimateGasKwh(p),
    estimated: !hasElec || !hasGas,
  };
}

/**
 * Compare un profil ménage à une liste d'offres énergie.
 * Trie par coût annuel croissant, calcule l'économie et le ROI éventuel.
 */
export function compareEnergy(
  profile: HouseholdProfile,
  offers: OfferInput[],
  options: CompareOptions = {},
): ComparisonResult {
  const { elecKwh, gasKwh, estimated } = resolveEnergyConsumption(profile);

  const ranked: OfferResult[] = offers
    .map((o): OfferResult | null => {
      const annualCost = energyOfferAnnualCost(o, elecKwh, gasKwh);
      if (annualCost === null) return null;
      return {
        offerId: o.id,
        providerId: o.providerId,
        providerName: o.providerName,
        offerName: o.name,
        annualCost,
      };
    })
    .filter((r): r is OfferResult => r !== null)
    .sort((a, b) => a.annualCost - b.annualCost);

  const best = ranked[0] ?? null;

  const currentCostAnnual =
    options.currentCostAnnual === undefined || options.currentCostAnnual === null
      ? null
      : options.currentCostAnnual;

  const savingsAnnual =
    currentCostAnnual !== null && best
      ? round2(currentCostAnnual - best.annualCost)
      : null;

  const fees = options.switchingFees ?? 0;
  const roiMonths =
    fees > 0 && savingsAnnual !== null && savingsAnnual > 0
      ? Math.round((fees / (savingsAnnual / 12)) * 10) / 10
      : null;

  return {
    category: "energy",
    currentCostAnnual,
    ranked,
    best,
    savingsAnnual,
    roiMonths,
    estimated,
  };
}
