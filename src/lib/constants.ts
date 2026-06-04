/**
 * Constantes métier partagées (libellés FR, options de formulaires).
 * Source de vérité pour l'UI ; les valeurs (`value`) correspondent aux
 * colonnes texte de la base (`households`, `profiles`, enums).
 */

export const APP_NAME = "Conso360";

// --- Régions belges -------------------------------------------------------
export const REGIONS = [
  { value: "wallonie", label: "Wallonie" },
  { value: "flandre", label: "Flandre" },
  { value: "bruxelles", label: "Bruxelles" },
] as const;
export type Region = (typeof REGIONS)[number]["value"];

// --- Type de logement -----------------------------------------------------
export const HOUSING_TYPES = [
  { value: "maison", label: "Maison" },
  { value: "appartement", label: "Appartement" },
  { value: "studio", label: "Studio" },
  { value: "autre", label: "Autre" },
] as const;
export type HousingType = (typeof HOUSING_TYPES)[number]["value"];

// --- Statut d'occupation --------------------------------------------------
export const OWNERSHIP = [
  { value: "proprietaire", label: "Propriétaire" },
  { value: "locataire", label: "Locataire" },
] as const;
export type Ownership = (typeof OWNERSHIP)[number]["value"];

// --- Usage internet -------------------------------------------------------
export const INTERNET_USAGE = [
  { value: "leger", label: "Léger" },
  { value: "moyen", label: "Moyen" },
  { value: "intensif", label: "Intensif" },
] as const;
export type InternetUsage = (typeof INTERNET_USAGE)[number]["value"];

// --- Catégories de contrats -----------------------------------------------
export const CATEGORIES = [
  { value: "energy", label: "Énergie" },
  { value: "telecom", label: "Télécom" },
  { value: "insurance", label: "Assurance" },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];

// --- Formules / paliers d'abonnement --------------------------------------
export const PLAN_TIERS = [
  { value: "free", label: "Gratuit", formule: "Formule 1" },
  { value: "basic", label: "Basic", formule: "Formule 1" },
  { value: "plus", label: "Plus", formule: "Formule 2" },
  { value: "premium", label: "Premium", formule: "Formule 3" },
] as const;
export type PlanTier = (typeof PLAN_TIERS)[number]["value"];

/** Routes de l'espace client protégé (utilisées par le middleware). */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profil-menage",
  "/contrats",
  "/comparateur",
  "/alertes",
  "/audit",
  "/abonnement",
] as const;
