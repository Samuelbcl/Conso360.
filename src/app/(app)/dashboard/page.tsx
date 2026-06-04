import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Household } from "@/types/database";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle<Household>();

  const profileComplete = Boolean(
    household?.region && household?.household_size,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Bienvenue. Voici l&apos;état de votre suivi Conso360.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profil ménage</CardTitle>
            <CardDescription>
              {profileComplete
                ? "Profil renseigné — base de toutes vos comparaisons."
                : "À compléter pour estimer vos économies."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant={profileComplete ? "outline" : "default"}
              render={<Link href="/profil-menage" />}
            >
              {profileComplete ? "Modifier" : "Compléter mon profil"}
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Comparateur énergie</CardTitle>
            <CardDescription>Bientôt — Phase 2 (MVP énergie).</CardDescription>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Mes contrats &amp; factures</CardTitle>
            <CardDescription>Bientôt — Phase 3 (Formule 2).</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
