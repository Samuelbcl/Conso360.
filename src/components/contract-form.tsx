"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveContract } from "@/app/(app)/contrats/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contract } from "@/types/database";

const str = (v: number | string | null | undefined) =>
  v === null || v === undefined ? "" : String(v);

export function ContractForm({
  contract,
  onSaved,
}: {
  contract?: Contract | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    provider_name: contract?.provider_name ?? "",
    offer_name: contract?.offer_name ?? "",
    monthly_cost: str(contract?.monthly_cost),
    annual_cost: str(contract?.annual_cost),
    renewal_date: contract?.renewal_date ?? "",
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveContract(
        { ...form, category: "energy" },
        contract?.id,
      );
      if (result.ok) {
        toast.success(contract ? "Contrat mis à jour." : "Contrat ajouté.");
        if (!contract)
          setForm({
            provider_name: "",
            offer_name: "",
            monthly_cost: "",
            annual_cost: "",
            renewal_date: "",
          });
        onSaved?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="provider_name">Fournisseur actuel</Label>
        <Input
          id="provider_name"
          value={form.provider_name}
          onChange={(e) => set("provider_name", e.target.value)}
          placeholder="Ex. Engie"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="offer_name">Offre (optionnel)</Label>
        <Input
          id="offer_name"
          value={form.offer_name}
          onChange={(e) => set("offer_name", e.target.value)}
          placeholder="Ex. Easy Fixe"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="monthly_cost">Coût mensuel (€)</Label>
        <Input
          id="monthly_cost"
          type="number"
          min={0}
          step="0.01"
          value={form.monthly_cost}
          onChange={(e) => set("monthly_cost", e.target.value)}
          placeholder="Ex. 180"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="annual_cost">ou Coût annuel (€)</Label>
        <Input
          id="annual_cost"
          type="number"
          min={0}
          step="0.01"
          value={form.annual_cost}
          onChange={(e) => set("annual_cost", e.target.value)}
          placeholder="Ex. 2160"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="renewal_date">Échéance / renouvellement</Label>
        <Input
          id="renewal_date"
          type="date"
          value={form.renewal_date}
          onChange={(e) => set("renewal_date", e.target.value)}
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : contract ? "Mettre à jour" : "Ajouter le contrat"}
        </Button>
      </div>
    </form>
  );
}
