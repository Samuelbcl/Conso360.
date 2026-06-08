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
import { eur } from "@/lib/format";
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

  const { data: lastComparison } = await supabase
    .from("comparisons")
    .select("savings_annual")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ savings_annual: number | null }>();

  const savings = lastComparison?.savings_annual ?? null;

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

      {savings !== null && savings > 0 && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          💡 Économie potentielle détectée :{" "}
          <strong>{eur(savings)} / an</strong>.{" "}
          <Link href="/contrats" className="underline">
            Voir le détail
          </Link>
        </div>
      )}

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
              nativeButton={false}
              render={<Link href="/profil-menage" />}
            >
              {profileComplete ? "Modifier" : "Compléter mon profil"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparateur énergie</CardTitle>
            <CardDescription>
              Estimez votre coût annuel et l&apos;économie possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" nativeButton={false} render={<Link href="/comparateur" />}>
              Comparer mes offres
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes contrats &amp; factures</CardTitle>
            <CardDescription>
              Encodez vos contrats et suivez vos économies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" nativeButton={false} render={<Link href="/contrats" />}>
              Gérer mes contrats
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
