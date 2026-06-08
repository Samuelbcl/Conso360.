/**
 * Types du moteur de comparaison (pur, indépendant de Next.js / Supabase).
 * Voir docs/COMPARISON-ENGINE.md.
 */

export type Category = "energy" | "telecom" | "insurance";

/** Profil ménage = entrée principale du moteur (dérivé de `households`). */
export interface HouseholdProfile {
  householdSize?: number;
  housingType?: "maison" | "appartement" | "studio" | "autre";
  ownership?: "proprietaire" | "locataire";
  hasEv?: boolean;
  region?: "wallonie" | "flandre" | "bruxelles";
  elecConsumptionKwh?: number;
  gasConsumptionKwh?: number;
  internetUsage?: "leger" | "moyen" | "intensif";
  gsmCount?: number;
}

/** Une offre du marché, telle que passée au moteur. */
export interface OfferInput {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  /** JSON `offers.price_structure` (ex. énergie : abonnement_annuel, prix_kwh_elec…). */
  priceStructure: Record<string, number | string>;
}

/** Résultat chiffré pour une offre. */
export interface OfferResult {
  offerId: string;
  providerId: string;
  providerName: string;
  offerName: string;
  annualCost: number;
}

/** Résultat complet d'une comparaison pour une catégorie. */
export interface ComparisonResult {
  category: Category;
  /** Coût actuel annuel (contrat/facture) ou null si inconnu. */
  currentCostAnnual: number | null;
  /** Offres chiffrées, triées par coût annuel croissant. */
  ranked: OfferResult[];
  /** Meilleure offre (moins chère) ou null si aucune offre exploitable. */
  best: OfferResult | null;
  /** Économie annuelle = coût actuel − meilleur coût (null si coût actuel inconnu). */
  savingsAnnual: number | null;
  /** Temps de retour en mois si des frais de changement sont fournis, sinon null. */
  roiMonths: number | null;
  /** True si l'entrée de conso a été estimée (profil sans facture). */
  estimated: boolean;
}

export interface CompareOptions {
  /** Coût actuel annuel connu (contrat/facture). */
  currentCostAnnual?: number | null;
  /** Frais éventuels liés au changement (pour le ROI). */
  switchingFees?: number;
}
