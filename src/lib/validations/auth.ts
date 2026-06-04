import { z } from "zod";

export const emailSchema = z.email("Adresse e-mail invalide.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis."),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Nom requis.").max(120),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(72, "72 caractères maximum."),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
