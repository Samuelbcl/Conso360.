import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eur, eur2, kwh } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  compareEnergy,
  resolveEnergyConsumption,
  type HouseholdProfile,
} from "@/server/comparison";
import { getEnergyOffers } from "@/server/providers/energy-offers";
import type { Household } from "@/types/database";

export const metadata: Metadata = { title: "Comparateur énergie" };

const toNum = (v?: string) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export default async function ComparateurPage({
  searchParams,
}: {
  searchParams: Promise<{ elec?: string; gas?: string; current?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle<Household>();

  const { offers, hasExample } = await getEnergyOffers();

  const elecOverride = toNum(sp.elec);
  const gasOverride = toNum(sp.gas);
  const currentCost = toNum(sp.current);

  const profile: HouseholdProfile = {
    householdSize: household?.household_size ?? undefined,
    housingType: household?.housing_type ?? undefined,
    region: household?.region ?? undefined,
    hasEv: household?.has_ev ?? undefined,
    elecConsumptionKwh: elecOverride ?? household?.elec_consumption_kwh ?? undefined,
    gasConsumptionKwh: gasOverride ?? household?.gas_consumption_kwh ?? undefined,
  };

  const used = resolveEnergyConsumption(profile);
  const result = compareEnergy(profile, offers, { currentCostAnnual: currentCost });

  const formElec = sp.elec ?? household?.elec_consumption_kwh?.toString() ?? "";
  const formGas = sp.gas ?? household?.gas_consumption_kwh?.toString() ?? "";

  return (
    <div className="space-y-6">
      <PageHeading icon={BarChart3} chip="bg-sky-100 text-sky-600" title="Comparateur énergie">
        Estimez votre coût annuel et l&apos;économie possible en changeant
        d&apos;offre.
      </PageHeading>

      {hasExample && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          ⚠️ Tarifs <strong>d&apos;exemple, non contractuels</strong> — à remplacer par
          une source vérifiée avant tout usage réel.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Votre consommation</CardTitle>
          <CardDescription>
            Pré-rempli depuis votre{" "}
            <Link href="/profil-menage" className="underline">
              profil ménage
            </Link>
            . Laissez vide pour une estimation automatique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 sm:grid-cols-3 sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="elec">Électricité (kWh/an)</Label>
              <Input id="elec" name="elec" type="number" min={0} defaultValue={formElec} placeholder="Ex. 3500" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gas">Gaz (kWh/an)</Label>
              <Input id="gas" name="gas" type="number" min={0} defaultValue={formGas} placeholder="Ex. 12000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current">Coût actuel (€/an)</Label>
              <Input id="current" name="current" type="number" min={0} defaultValue={sp.current ?? ""} placeholder="optionnel" />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit">Comparer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result.estimated && (
        <p className="text-sm text-muted-foreground">
          Consommation estimée utilisée : <strong>{kwh(used.elecKwh)}</strong> élec ·{" "}
          <strong>{kwh(used.gasKwh)}</strong> gaz. Renseignez vos vraies valeurs pour
          plus de précision.
        </p>
      )}

      {result.best && currentCost !== undefined && result.savingsAnnual !== null && (
        <Card className={result.savingsAnnual > 0 ? "border-emerald-400" : ""}>
          <CardHeader>
            <CardDescription>Économie annuelle estimée</CardDescription>
            <CardTitle className="text-3xl">
              {result.savingsAnnual > 0 ? eur(result.savingsAnnual) : eur(0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {result.savingsAnnual > 0 ? (
              <>
                En passant à <strong>{result.best.providerName} — {result.best.offerName}</strong>{" "}
                ({eur2(result.best.annualCost)}/an) au lieu de {eur2(currentCost)}/an.
              </>
            ) : (
              <>Votre coût actuel est déjà compétitif par rapport aux offres listées.</>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Offres classées</CardTitle>
          <CardDescription>
            {result.ranked.length} offre(s), de la moins chère à la plus chère.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune offre exploitable. (Avez-vous appliqué le seed
              <code> 0003_seed_energy_offers.sql</code> ?)
            </p>
          ) : (
            <ol className="divide-y">
              {result.ranked.map((o, i) => (
                <li key={o.offerId} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-sm tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">
                        {o.providerName} — {o.offerName}
                        {i === 0 && (
                          <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Meilleure offre
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums">{eur2(o.annualCost)}/an</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
