"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  magicLinkSchema,
  signupSchema,
} from "@/lib/validations/auth";

export type AuthState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function safeNext(next?: string) {
  // N'autorise que les redirections internes (évite l'open redirect).
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export async function signIn(
  input: { email: string; password: string },
  next?: string,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Vérifiez votre e-mail et votre mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: "Identifiants incorrects." };
  }

  redirect(safeNext(next));
}

export async function signUp(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthState> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${appUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Confirmation e-mail désactivée → session immédiate.
  if (data.session) {
    redirect("/dashboard");
  }

  return {
    ok: true,
    message:
      "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.",
  };
}

export async function sendMagicLink(input: {
  email: string;
}): Promise<AuthState> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${appUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    message: "Lien de connexion envoyé. Consultez votre boîte mail.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
