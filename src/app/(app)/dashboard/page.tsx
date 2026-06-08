import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  FileText,
  PiggyBank,
  User,
} from "lucide-react";
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
  const profileComplete = Boolean(household?.region && household?.household_size);

  const cards = [
    {
      title: "Profil ménage",
      desc: profileComplete
        ? "Profil renseigné — base de vos comparaisons."
        : "À compléter pour estimer vos économies.",
      icon: User,
      chip: "bg-emerald-100 text-emerald-600",
      href: "/profil-menage",
      cta: profileComplete ? "Modifier" : "Compléter mon profil",
      primary: !profileComplete,
    },
    {
      title: "Comparateur énergie",
      desc: "Estimez votre coût annuel et l'économie possible.",
      icon: BarChart3,
      chip: "bg-sky-100 text-sky-600",
      href: "/comparateur",
      cta: "Comparer mes offres",
      primary: false,
    },
    {
      title: "Contrats & factures",
      desc: "Encodez vos contrats et suivez vos économies.",
      icon: FileText,
      chip: "bg-amber-100 text-amber-600",
      href: "/contrats",
      cta: "Gérer mes contrats",
      primary: false,
    },
    {
      title: "Alertes",
      desc: "Soyez prévenu dès qu'une meilleure offre apparaît.",
      icon: Bell,
      chip: "bg-violet-100 text-violet-600",
      href: "/alertes",
      cta: "Voir mes alertes",
      primary: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bonjour 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Voici l&apos;état de votre suivi Conso360.
        </p>
      </div>

      {savings !== null && savings > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 p-6 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/20">
              <PiggyBank className="size-6" />
            </span>
            <div>
              <p className="text-sm text-white/80">Économie potentielle détectée</p>
              <p className="font-heading text-3xl font-bold">{eur(savings)} / an</p>
            </div>
            <Button
              variant="secondary"
              className="ml-auto rounded-full bg-white text-emerald-700 hover:bg-white/90"
              nativeButton={false}
              render={<Link href="/contrats" />}
            >
              Voir le détail
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card
            key={c.title}
            className="flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <CardHeader>
              <span
                className={`grid size-11 place-items-center rounded-2xl ${c.chip}`}
              >
                <c.icon className="size-5" />
              </span>
              <CardTitle className="mt-3">{c.title}</CardTitle>
              <CardDescription>{c.desc}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                className="w-full rounded-full"
                variant={c.primary ? "default" : "outline"}
                nativeButton={false}
                render={<Link href={c.href} />}
              >
                {c.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
