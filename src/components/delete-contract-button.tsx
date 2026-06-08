"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteContract } from "@/app/(app)/contrats/actions";
import { Button } from "@/components/ui/button";

export function DeleteContractButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await deleteContract(id);
          if (r.ok) {
            toast.success("Contrat supprimé.");
            router.refresh();
          } else {
            toast.error(r.error);
          }
        })
      }
    >
      Supprimer
    </Button>
  );
}
