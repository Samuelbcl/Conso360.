"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type InvoiceState = { ok: true } | { ok: false; error: string };

/** Enregistre une facture déjà uploadée dans Storage (parsing en stub). */
export async function recordInvoice(filePath: string): Promise<InvoiceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  // Le chemin doit appartenir à l'utilisateur (dossier = son uid).
  if (!filePath.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Chemin de fichier invalide." };
  }

  const { error } = await supabase.from("invoices").insert({
    user_id: user.id,
    category: "energy",
    file_path: filePath,
    status: "uploaded",
    parsed_data: {},
  });
  if (error) return { ok: false, error: "Échec de l'enregistrement." };

  revalidatePath("/contrats");
  return { ok: true };
}

export async function deleteInvoice(
  invoiceId: string,
  filePath: string,
): Promise<InvoiceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  await supabase.storage.from("invoices").remove([filePath]);
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Échec de la suppression." };

  revalidatePath("/contrats");
  return { ok: true };
}
