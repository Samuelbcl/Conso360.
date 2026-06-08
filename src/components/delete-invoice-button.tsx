"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteInvoice } from "@/app/(app)/contrats/invoice-actions";
import { Button } from "@/components/ui/button";

export function DeleteInvoiceButton({ id, path }: { id: string; path: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await deleteInvoice(id, path);
          if (r.ok) {
            toast.success("Facture supprimée.");
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
