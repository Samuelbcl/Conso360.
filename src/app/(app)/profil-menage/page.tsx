import type { Metadata } from "next";
import { User } from "lucide-react";
import { HouseholdForm } from "@/components/household-form";
import { PageHeading } from "@/components/page-heading";
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
      <PageHeading icon={User} chip="bg-emerald-100 text-emerald-600" title="Profil ménage">
        Ces informations servent de base à toutes vos comparaisons et estimations
        d&apos;économies. Vous pouvez les modifier à tout moment.
      </PageHeading>
      <HouseholdForm household={household ?? null} />
    </div>
  );
}
