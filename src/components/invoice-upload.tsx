"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordInvoice } from "@/app/(app)/contrats/invoice-actions";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function InvoiceUpload({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onUpload(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Format PDF uniquement.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 Mo).");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${Date.now()}-${safe}`;

      const { error } = await supabase.storage
        .from("invoices")
        .upload(path, file, { contentType: "application/pdf" });
      if (error) {
        toast.error(`Échec de l'upload : ${error.message}`);
        return;
      }

      const r = await recordInvoice(path);
      if (r.ok) {
        toast.success("Facture importée.");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        toast.error(r.error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
      {busy && <span className="text-sm text-muted-foreground">Import…</span>}
    </div>
  );
}
