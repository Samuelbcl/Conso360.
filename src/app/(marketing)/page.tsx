import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  FileText,
  Gauge,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const STEPS = [
  {
    icon: Gauge,
    title: "Décrivez votre ménage",
    text: "Quelques infos (logement, conso, équipements) suffisent pour démarrer.",
  },
  {
    icon: TrendingDown,
    title: "Comparez en un clic",
    text: "On classe les offres du marché et on estime votre économie annuelle.",
  },
  {
    icon: BellRing,
    title: "Restez optimisé",
    text: "On vous alerte dès qu'une meilleure offre apparaît. Sans effort.",
  },
];

const CATEGORIES = [
  {
    icon: Zap,
    name: "Énergie",
    text: "Électricité & gaz : trouvez le tarif le plus avantageux pour votre profil.",
    color: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30",
    ring: "group-hover:ring-amber-200",
  },
  {
    icon: Wifi,
    name: "Télécom",
    text: "Internet & mobile : le bon forfait selon votre usage réel.",
    color: "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/30",
    ring: "group-hover:ring-sky-200",
  },
  {
    icon: ShieldCheck,
    name: "Assurances",
    text: "Comparez à garanties équivalentes, sans mauvaise surprise.",
    color: "bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-md shadow-violet-500/30",
    ring: "group-hover:ring-violet-200",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50 via-sky-50/50 to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <span className="inline-flex select-none items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              <Sparkles className="size-3.5" />
              Belgique · Énergie · Télécom · Assurances
            </span>
            <h1 className="mt-5 font-heading text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
              Réduisez{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                toutes vos factures
              </span>{" "}
              depuis un seul tableau de bord
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              {APP_NAME} compare, suit et optimise vos contrats en continu — le
              coach personnel des dépenses de votre ménage.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Créer mon compte gratuit
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/pricing" />}
              >
                Voir les tarifs
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Sans engagement · Aucune carte bancaire requise
            </p>
          </div>

          {/* Mock visuel (illustration, non interactif) */}
          <div className="relative mx-auto w-full max-w-sm select-none" aria-hidden="true">
            <div className="rounded-3xl border bg-card p-6 shadow-xl shadow-emerald-900/5 ring-1 ring-foreground/5">
              <span className="mb-4 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Aperçu
              </span>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <PiggyBank className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Économie estimée / an
                  </p>
                  <p className="font-heading text-2xl font-bold text-emerald-600">
                    + 240 €
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {[
                  { n: "Mega — Online Fixe", v: "1 980 €", best: true },
                  { n: "TotalEnergies — Pixel", v: "2 040 €", best: false },
                  { n: "Votre contrat actuel", v: "2 220 €", best: false },
                ].map((o) => (
                  <div
                    key={o.n}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                      o.best
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-transparent bg-muted/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {o.best && (
                        <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          TOP
                        </span>
                      )}
                      {o.n}
                    </span>
                    <span className="font-semibold tabular-nums">{o.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute -right-4 -top-4 hidden rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-lg sm:block">
              -11% 🎉
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">
          Simple, rapide, sans prise de tête
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border bg-card p-6 ring-1 ring-foreground/5"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-500/25">
                <s.icon className="size-6" strokeWidth={2.25} />
              </span>
              <p className="mt-4 font-heading font-semibold">
                <span className="text-muted-foreground">{i + 1}. </span>
                {s.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div
              key={c.name}
              className={`group rounded-2xl border bg-card p-6 ring-1 ring-foreground/5 transition-all hover:-translate-y-1 hover:shadow-lg ${c.ring}`}
            >
              <span
                className={`grid size-14 place-items-center rounded-2xl ${c.color}`}
              >
                <c.icon className="size-7" strokeWidth={2.25} />
              </span>
              <p className="mt-4 font-heading text-lg font-semibold">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-sky-500 px-6 py-14 text-center text-white shadow-xl sm:px-12">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative font-heading text-2xl font-bold sm:text-3xl">
            Prêt à payer vos factures moins cher ?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/90">
            Commencez gratuitement en moins de deux minutes. Vous gardez le contrôle,
            on s&apos;occupe du reste.
          </p>
          <div className="relative mt-7 flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full bg-white text-emerald-700 hover:bg-white/90"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Commencer maintenant
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <p className="relative mt-6 inline-flex items-center gap-2 text-xs text-white/80">
            <FileText className="size-3.5" />
            Service de comparaison et de suivi — pas une autorité tarifaire.
          </p>
        </div>
      </section>
    </div>
  );
}
