/**
 * Types domaine alignés sur `supabase/migrations/0001_init.sql`.
 *
 * ⚠️ Écrits à la main pour la Phase 1. À REMPLACER par les types générés
 *    une fois le projet Supabase créé :
 *      npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 *    (ou --local avec la CLI). En attendant, le client Supabase est utilisé
 *    sans générique : ces types servent au code applicatif (formulaires, vues).
 */

import type {
  Category,
  HousingType,
  InternetUsage,
  Ownership,
  PlanTier,
  Region,
} from "@/lib/constants";

export type { Category, HousingType, InternetUsage, Ownership, PlanTier, Region };

export type AlertStatus = "new" | "read" | "dismissed";
export type AffiliateType = "click" | "conversion";
export type AuditStatus =
  | "requested"
  | "scheduled"
  | "in_progress"
  | "done"
  | "cancelled";

/** profiles — extension 1:1 de auth.users */
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  plan_tier: PlanTier;
  created_at: string;
  updated_at: string;
}

/** households — situation du ménage (entrée du moteur de comparaison) */
export interface Household {
  id: string;
  user_id: string;
  household_size: number | null;
  housing_type: HousingType | null;
  ownership: Ownership | null;
  is_independent: boolean | null;
  has_ev: boolean | null;
  region: Region | null;
  postal_code: string | null;
  elec_consumption_kwh: number | null;
  gas_consumption_kwh: number | null;
  internet_usage: InternetUsage | null;
  gsm_count: number | null;
  created_at: string;
  updated_at: string;
}

/** providers — fournisseurs (lecture publique) */
export interface Provider {
  id: string;
  category: Category;
  name: string;
  logo_url: string | null;
  website: string | null;
  affiliate_url: string | null;
  commission_amount: number | null;
  active: boolean;
  created_at: string;
}

/** offers — offres/tarifs (lecture publique) */
export interface Offer {
  id: string;
  provider_id: string;
  category: Category;
  name: string;
  description: string | null;
  price_structure: Record<string, number | string>;
  conditions: Record<string, unknown>;
  is_example: boolean;
  valid_from: string | null;
  valid_to: string | null;
  active: boolean;
  created_at: string;
}

/** contracts — contrats actuels du client */
export interface Contract {
  id: string;
  user_id: string;
  category: Category;
  provider_id: string | null;
  provider_name: string | null;
  offer_name: string | null;
  monthly_cost: number | null;
  annual_cost: number | null;
  start_date: string | null;
  renewal_date: string | null;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** invoices — factures PDF (Storage) + données extraites */
export interface Invoice {
  id: string;
  user_id: string;
  contract_id: string | null;
  category: Category;
  file_path: string;
  parsed_data: Record<string, unknown>;
  status: string;
  uploaded_at: string;
}

/** comparisons — résultats persistés du moteur */
export interface Comparison {
  id: string;
  user_id: string;
  household_id: string | null;
  category: Category;
  current_cost_annual: number | null;
  best_offer_id: string | null;
  best_cost_annual: number | null;
  savings_annual: number | null;
  roi_months: number | null;
  result: Record<string, unknown>;
  created_at: string;
}

/** alerts — meilleures offres détectées */
export interface Alert {
  id: string;
  user_id: string;
  category: Category;
  message: string;
  offer_id: string | null;
  status: AlertStatus;
  created_at: string;
}

/** savings_reports — rapports PDF d'économies */
export interface SavingsReport {
  id: string;
  user_id: string;
  period: string | null;
  total_savings: number | null;
  report_pdf_path: string | null;
  created_at: string;
}
