import { z } from "zod";

const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);

const optNumber = z.preprocess(
  emptyToUndef,
  z.coerce
    .number()
    .min(0, "Doit être positif.")
    .max(1_000_000, "Valeur trop élevée.")
    .optional(),
);

const optDate = z.preprocess(
  emptyToUndef,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue (AAAA-MM-JJ).")
    .optional(),
);

const optText = (max: number) =>
  z.preprocess(emptyToUndef, z.string().trim().max(max).optional());

export const contractSchema = z
  .object({
    category: z.enum(["energy", "telecom", "insurance"]).default("energy"),
    provider_name: z.string().trim().min(1, "Fournisseur requis.").max(120),
    offer_name: optText(120),
    monthly_cost: optNumber,
    annual_cost: optNumber,
    renewal_date: optDate,
  })
  .refine((d) => d.monthly_cost !== undefined || d.annual_cost !== undefined, {
    message: "Indiquez au moins un coût (mensuel ou annuel).",
    path: ["annual_cost"],
  });

export type ContractInput = z.infer<typeof contractSchema>;

/** Complète le coût manquant (annuel ⇄ mensuel) à partir de l'autre. */
export function normalizeCosts(input: { monthly_cost?: number; annual_cost?: number }) {
  const annual =
    input.annual_cost ??
    (input.monthly_cost !== undefined
      ? Math.round(input.monthly_cost * 12 * 100) / 100
      : undefined);
  const monthly =
    input.monthly_cost ??
    (input.annual_cost !== undefined
      ? Math.round((input.annual_cost / 12) * 100) / 100
      : undefined);
  return { monthly_cost: monthly ?? null, annual_cost: annual ?? null };
}
