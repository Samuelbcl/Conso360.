import type { Metadata } from "next";
import { HouseholdForm } from "@/components/household-form";
import { createClient } from "@/lib/supabase/server";
import type { Household } from "@/types/database";

export const metadata: Metadata = { title: "Profil ménage" };

export default async function ProfilMenagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle<Household>();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil ménage</h1>
        <p className="text-muted-foreground">
          Ces informations servent de base à toutes vos comparaisons et
          estimations d&apos;économies. Vous pouvez les modifier à tout moment.
        </p>
      </div>
      <HouseholdForm household={household ?? null} />
    </div>
  );
}
