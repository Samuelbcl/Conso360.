import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { CompareContractButton } from "@/components/compare-contract-button";
import { ContractForm } from "@/components/contract-form";
import { DeleteContractButton } from "@/components/delete-contract-button";
import { DeleteInvoiceButton } from "@/components/delete-invoice-button";
import { InvoiceUpload } from "@/components/invoice-upload";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { eur, eur2 } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ComparisonResult } from "@/server/comparison";
import type { Comparison, Contract, Invoice } from "@/types/database";

const fileName = (path: string) =>
  (path.split("/").pop() ?? path).replace(/^\d+-/, "");

export const metadata: Metadata = { title: "Mes contrats" };

export default async function ContratsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("user_id", user!.id)
    .eq("category", "energy")
    .order("created_at", { ascending: false })
    .returns<Contract[]>();

  const list = contracts ?? [];

  const { data: lastComparison } = await supabase
    .from("comparisons")
    .select("*")
    .eq("user_id", user!.id)
    .eq("category", "energy")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Comparison>();

  const lastResult = lastComparison?.result as ComparisonResult | undefined;

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user!.id)
    .order("uploaded_at", { ascending: false })
    .returns<Invoice[]>();

  const invoiceList = invoices ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeading icon={FileText} chip="bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30" title="Mes contrats énergie">
        Encodez vos contrats actuels pour les comparer au marché et suivre vos
        économies.
      </PageHeading>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un contrat</CardTitle>
          <CardDescription>Électricité / gaz — votre contrat en cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContractForm />
        </CardContent>
      </Card>

      {lastComparison && (
        <Card
          className={
            lastComparison.savings_annual && lastComparison.savings_annual > 0
              ? "border-emerald-400"
              : ""
          }
        >
          <CardHeader>
            <CardDescription>Dernière comparaison</CardDescription>
            <CardTitle className="text-2xl">
              {lastComparison.savings_annual && lastComparison.savings_annual > 0
                ? `${eur(lastComparison.savings_annual)} d'économie / an`
                : "Votre contrat est déjà compétitif"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lastResult?.best ? (
              <>
                Meilleure offre :{" "}
                <strong>
                  {lastResult.best.providerName} — {lastResult.best.offerName}
                </strong>{" "}
                ({eur2(lastResult.best.annualCost)}/an)
                {lastComparison.current_cost_annual
                  ? ` vs ${eur2(lastComparison.current_cost_annual)}/an actuellement.`
                  : "."}
              </>
            ) : (
              "Aucune offre exploitable."
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href="/contrats/rapport" />}
              >
                Télécharger le rapport PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {list.length} contrat(s) enregistré(s)
        </h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun contrat pour l&apos;instant.
          </p>
        ) : (
          list.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">
                    {c.provider_name}
                    {c.offer_name ? ` — ${c.offer_name}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {c.annual_cost !== null
                      ? `${eur2(c.annual_cost)}/an`
                      : "coût non renseigné"}
                    {c.renewal_date ? ` · échéance ${c.renewal_date}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CompareContractButton id={c.id} />
                  <DeleteContractButton id={c.id} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importer une facture (PDF)</CardTitle>
          <CardDescription>
            Conservez vos factures au même endroit. L&apos;extraction automatique
            des données arrive bientôt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InvoiceUpload userId={user!.id} />
          {invoiceList.length > 0 && (
            <ul className="divide-y">
              {invoiceList.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{fileName(inv.file_path)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.uploaded_at).toLocaleDateString("fr-BE")} ·{" "}
                      {inv.status === "uploaded" ? "importée (extraction à venir)" : inv.status}
                    </p>
                  </div>
                  <DeleteInvoiceButton id={inv.id} path={inv.file_path} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
