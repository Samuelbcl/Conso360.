import type { Metadata } from "next";
import { ContractForm } from "@/components/contract-form";
import { DeleteContractButton } from "@/components/delete-contract-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { eur2 } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Contract } from "@/types/database";

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mes contrats énergie
        </h1>
        <p className="text-muted-foreground">
          Encodez vos contrats actuels pour les comparer au marché et suivre vos
          économies.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un contrat</CardTitle>
          <CardDescription>Électricité / gaz — votre contrat en cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContractForm />
        </CardContent>
      </Card>

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
                <DeleteContractButton id={c.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
