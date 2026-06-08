import type { HouseholdProfile } from "./types";

/**
 * Abaques d'estimation de consommation — VALEURS D'EXEMPLE, ordres de grandeur
 * pour un ménage belge. À affiner (et documenter la source) avant usage réel.
 * Utilisées uniquement quand la conso n'est pas renseignée (estimation F1).
 */

// Électricité (kWh/an) selon la taille du ménage (hors véhicule électrique).
const ELEC_BASE_BY_SIZE: Record<number, number> = {
  1: 1600,
  2: 2400,
  3: 3500,
  4: 4200,
  5: 5000,
};
const ELEC_DEFAULT = 3500;
const EV_EXTRA_KWH = 2500; // surconsommation indicative d'un véhicule électrique

// Gaz (kWh/an) selon le type de logement (hypothèse : chauffage au gaz).
const GAS_BY_HOUSING: Record<string, number> = {
  maison: 17000,
  appartement: 9000,
  studio: 5000,
  autre: 12000,
};
const GAS_DEFAULT = 12000;

export function estimateElecKwh(p: HouseholdProfile): number {
  const size =
    p.householdSize && p.householdSize > 0 ? Math.min(p.householdSize, 5) : 0;
  const base = size ? (ELEC_BASE_BY_SIZE[size] ?? ELEC_DEFAULT) : ELEC_DEFAULT;
  return base + (p.hasEv ? EV_EXTRA_KWH : 0);
}

export function estimateGasKwh(p: HouseholdProfile): number {
  const base = GAS_BY_HOUSING[p.housingType ?? "autre"] ?? GAS_DEFAULT;
  const size = p.householdSize && p.householdSize > 0 ? p.householdSize : 2;
  const factor = Math.max(0.6, 1 + (size - 2) * 0.08); // ajustement taille du ménage
  return Math.round(base * factor);
}
