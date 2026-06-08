"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { compareContract } from "@/app/(app)/contrats/actions";
import { Button } from "@/components/ui/button";

export function CompareContractButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await compareContract(id);
          if (r.ok) {
            if (r.savingsAnnual !== null && r.savingsAnnual > 0) {
              toast.success(
                `Économie estimée : ${Math.round(r.savingsAnnual)} €/an${
                  r.bestProvider ? ` avec ${r.bestProvider}` : ""
                }`,
              );
            } else {
              toast.success("Comparaison enregistrée — votre contrat est déjà compétitif.");
            }
            router.refresh();
          } else {
            toast.error(r.error);
          }
        })
      }
    >
      {pending ? "Comparaison…" : "Comparer au marché"}
    </Button>
  );
}
