import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

const FORMULES = [
  {
    nom: "Comparateur simple",
    tag: "Formule 1",
    pitch:
      "Consultez les offres du marché, filtrez par profil et estimez vos économies.",
    prix: "Gratuit",
  },
  {
    nom: "Comparateur personnalisé",
    tag: "Formule 2",
    pitch:
      "Encodez vos contrats, importez vos factures, comparaison automatique et alertes.",
    prix: "5–10 €/mois",
  },
  {
    nom: "Audit & accompagnement",
    tag: "Formule 3",
    pitch:
      "Audit annuel, conseiller dédié et gestion du changement de fournisseur.",
    prix: "15–30 €/mois",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Se connecter
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Commencer
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Belgique · Énergie · Télécom · Assurances
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Un seul tableau de bord pour réduire toutes vos factures
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          {APP_NAME} compare, suit et optimise vos contrats en continu — le coach
          personnel des dépenses de votre ménage.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" render={<Link href="/signup" />}>
            Créer mon compte
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            J&apos;ai déjà un compte
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {FORMULES.map((f) => (
            <Card key={f.tag}>
              <CardHeader>
                <p className="text-xs font-medium text-muted-foreground">
                  {f.tag}
                </p>
                <CardTitle>{f.nom}</CardTitle>
                <CardDescription>{f.pitch}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{f.prix}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Service de comparaison et de suivi. Conso360 n&apos;est pas une autorité
          tarifaire ni un courtier agréé.
        </p>
      </section>
    </div>
  );
}
