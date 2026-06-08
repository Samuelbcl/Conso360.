"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkEnergyAlerts, updateAlertStatus } from "@/app/(app)/alertes/actions";
import { Button } from "@/components/ui/button";
import type { AlertStatus } from "@/types/database";

export function CheckAlertsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await checkEnergyAlerts();
          if (r.ok) {
            toast.success(
              r.created > 0
                ? `${r.created} nouvelle(s) alerte(s) détectée(s).`
                : "Aucune nouvelle alerte — tout est à jour.",
            );
            router.refresh();
          } else {
            toast.error(r.error);
          }
        })
      }
    >
      {pending ? "Vérification…" : "Vérifier les alertes"}
    </Button>
  );
}

export function AlertStatusButtons({
  id,
  status,
}: {
  id: string;
  status: AlertStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const act = (s: AlertStatus) =>
    startTransition(async () => {
      const r = await updateAlertStatus(id, s);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });

  return (
    <div className="flex shrink-0 gap-1">
      {status !== "read" && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => act("read")}>
          Marquer lu
        </Button>
      )}
      {status !== "dismissed" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => act("dismissed")}
        >
          Ignorer
        </Button>
      )}
    </div>
  );
}
