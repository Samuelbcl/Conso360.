import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { AlertStatusButtons, CheckAlertsButton } from "@/components/alert-controls";
import { PageHeading } from "@/components/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Alert } from "@/types/database";

export const metadata: Metadata = { title: "Alertes" };

const STATUS_LABEL: Record<string, string> = {
  new: "Nouveau",
  read: "Lu",
  dismissed: "Ignoré",
};

export default async function AlertesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<Alert[]>();

  const list = (alerts ?? []).filter((a) => a.status !== "dismissed");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading icon={Bell} chip="bg-violet-100 text-violet-600" title="Alertes">
          Conso360 vous prévient quand une meilleure offre apparaît pour vos
          contrats.
        </PageHeading>
        <CheckAlertsButton />
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucune alerte active. Ajoutez un contrat dans{" "}
            <strong>Contrats</strong>, puis lancez une vérification.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card key={a.id} className={a.status === "new" ? "border-amber-400" : ""}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        a.status === "new"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("fr-BE")}
                    </span>
                  </div>
                  <p className="text-sm">{a.message}</p>
                </div>
                <AlertStatusButtons id={a.id} status={a.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
