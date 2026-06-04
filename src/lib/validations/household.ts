import { z } from "zod";
import {
  HOUSING_TYPES,
  INTERNET_USAGE,
  OWNERSHIP,
  REGIONS,
} from "@/lib/constants";

const values = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as [string, ...string[]];

/** "" ou null venant d'un <select> non choisi → undefined. */
const optionalEnum = (opts: readonly { value: string }[]) =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.enum(values(opts)).optional(),
  );

/** Champ numérique optionnel : "" → undefined, sinon entier >= 0. */
const optionalInt = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce
      .number()
      .int("Nombre entier attendu.")
      .min(0, "Doit être positif.")
      .max(max, `Valeur trop élevée (max ${max}).`)
      .optional(),
  );

export const householdSchema = z.object({
  household_size: optionalInt(30),
  housing_type: optionalEnum(HOUSING_TYPES),
  ownership: optionalEnum(OWNERSHIP),
  is_independent: z.boolean().default(false),
  has_ev: z.boolean().default(false),
  region: optionalEnum(REGIONS),
  postal_code: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z
      .string()
      .regex(/^\d{4}$/, "Code postal belge : 4 chiffres.")
      .optional(),
  ),
  elec_consumption_kwh: optionalInt(100_000),
  gas_consumption_kwh: optionalInt(200_000),
  internet_usage: optionalEnum(INTERNET_USAGE),
  gsm_count: optionalInt(20),
});

export type HouseholdInput = z.infer<typeof householdSchema>;
