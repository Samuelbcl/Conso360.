import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Trois formules pour comparer, suivre et optimiser vos contrats énergie, télécom et assurances.",
};

const PLANS = [
  {
    tag: "Formule 1",
    nom: "Comparateur simple",
    prix: "Gratuit",
    sousTitre: "ou 2–5 €/mois sans pub",
    description: "Pour explorer le marché et estimer vos économies.",
    icon: Sparkles,
    chip: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30",
    features: [
      "Consultation des offres du marché",
      "Filtres par profil (ménage, logement, VE…)",
      "Estimation rapide des économies",
      "Comparateur énergie",
    ],
    cta: "Commencer gratuitement",
    href: "/signup",
    highlight: false,
  },
  {
    tag: "Formule 2",
    nom: "Comparateur personnalisé",
    prix: "5–10 €/mois",
    sousTitre: "le suivi continu",
    description: "Pour suivre vos contrats et être alerté des meilleures offres.",
    icon: TrendingDown,
    chip: "bg-white/20 text-white",
    features: [
      "Tout de la Formule 1",
      "Encodage de vos contrats actuels",
      "Import de factures PDF",
      "Comparaison automatique",
      "Alertes meilleures offres",
      "Rapport PDF d'économies",
    ],
    cta: "Choisir Plus",
    href: "/signup",
    highlight: true,
  },
  {
    tag: "Formule 3",
    nom: "Audit & accompagnement",
    prix: "15–30 €/mois",
    sousTitre: "ou 150–300 €/an",
    description: "Pour être accompagné de bout en bout.",
    icon: Crown,
    chip: "bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-md shadow-violet-500/30",
    features: [
      "Tout de la Formule 2",
      "Audit annuel de tous vos contrats",
      "Conseiller dédié",
      "Gestion du changement de fournisseur",
      "Assistance téléphonique",
    ],
    cta: "Choisir Premium",
    href: "/signup",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <Sparkles className="size-3.5" />
          Tarifs
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Une formule pour chaque besoin
        </h1>
        <p className="mt-4 text-muted-foreground">
          Chaque formule inclut la précédente. Commencez gratuitement, évoluez quand
          vous voulez.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {PLANS.map((p) => {
          const popular = p.highlight;
          return (
            <Card
              key={p.tag}
              className={
                popular
                  ? "relative bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-xl lg:-mt-4 lg:pb-2"
                  : "relative"
              }
            >
              {popular && (
                <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                  ★ Populaire
                </span>
              )}
              <CardHeader>
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${p.chip}`}
                >
                  <p.icon className="size-6" strokeWidth={2.25} />
                </span>
                <p
                  className={`mt-3 text-xs font-medium ${popular ? "text-white/80" : "text-muted-foreground"}`}
                >
                  {p.tag}
                </p>
                <CardTitle className="text-xl">{p.nom}</CardTitle>
                <p className="pt-2 font-heading text-3xl font-bold">{p.prix}</p>
                <CardDescription className={popular ? "text-white/80" : ""}>
                  {p.sousTitre}
                </CardDescription>
                <CardDescription
                  className={popular ? "pt-2 text-white/90" : "pt-2"}
                >
                  {p.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${popular ? "text-white" : "text-emerald-600"}`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full rounded-full"
                  variant={popular ? "secondary" : "outline"}
                  nativeButton={false}
                  render={<Link href={p.href} />}
                >
                  {p.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
        Les paiements (Stripe) seront activés ultérieurement. En cas de commission
        d&apos;affiliation sur un changement de fournisseur, l&apos;information sera
        affichée de manière transparente.
      </p>
    </div>
  );
}
