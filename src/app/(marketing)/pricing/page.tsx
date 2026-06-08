import type { Metadata } from "next";
import Link from "next/link";
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
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Une formule pour chaque besoin
        </h1>
        <p className="mt-4 text-muted-foreground">
          Chaque formule inclut la précédente. Commencez gratuitement, évoluez quand
          vous voulez.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.tag} className={p.highlight ? "border-primary shadow-sm" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{p.tag}</p>
                {p.highlight && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Populaire
                  </span>
                )}
              </div>
              <CardTitle className="text-xl">{p.nom}</CardTitle>
              <p className="pt-2 text-3xl font-semibold">{p.prix}</p>
              <CardDescription>{p.sousTitre}</CardDescription>
              <CardDescription className="pt-2">{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={p.highlight ? "default" : "outline"}
                nativeButton={false}
                render={<Link href={p.href} />}
              >
                {p.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
        Les paiements (Stripe) seront activés ultérieurement. En cas de commission
        d&apos;affiliation sur un changement de fournisseur, l&apos;information sera
        affichée de manière transparente.
      </p>
    </div>
  );
}
