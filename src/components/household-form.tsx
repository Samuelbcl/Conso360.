"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveHousehold } from "@/app/(app)/profil-menage/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HOUSING_TYPES,
  INTERNET_USAGE,
  OWNERSHIP,
  REGIONS,
} from "@/lib/constants";
import type { Household } from "@/types/database";

type Options = readonly { value: string; label: string }[];

const str = (v: number | string | null | undefined) =>
  v === null || v === undefined ? "" : String(v);

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
}: {
  id: string;
  label: string;
  options: Options;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || null}
        onValueChange={(v) => onChange(typeof v === "string" ? v : "")}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {suffix ? (
          <span className="text-muted-foreground"> ({suffix})</span>
        ) : null}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function HouseholdForm({ household }: { household: Household | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    household_size: str(household?.household_size),
    region: household?.region ?? "",
    housing_type: household?.housing_type ?? "",
    ownership: household?.ownership ?? "",
    postal_code: household?.postal_code ?? "",
    is_independent: household?.is_independent ?? false,
    has_ev: household?.has_ev ?? false,
    elec_consumption_kwh: str(household?.elec_consumption_kwh),
    gas_consumption_kwh: str(household?.gas_consumption_kwh),
    internet_usage: household?.internet_usage ?? "",
    gsm_count: str(household?.gsm_count),
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveHousehold(form);
      if (result.ok) {
        toast.success("Profil ménage enregistré.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Situation du ménage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="household_size"
            label="Taille du ménage"
            value={form.household_size}
            onChange={(v) => set("household_size", v)}
            placeholder="Ex. 3"
            suffix="personnes"
          />
          <SelectField
            id="region"
            label="Région"
            options={REGIONS}
            value={form.region}
            onChange={(v) => set("region", v)}
          />
          <SelectField
            id="housing_type"
            label="Type de logement"
            options={HOUSING_TYPES}
            value={form.housing_type}
            onChange={(v) => set("housing_type", v)}
          />
          <SelectField
            id="ownership"
            label="Statut d'occupation"
            options={OWNERSHIP}
            value={form.ownership}
            onChange={(v) => set("ownership", v)}
          />
          <div className="grid gap-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input
              id="postal_code"
              inputMode="numeric"
              maxLength={4}
              value={form.postal_code}
              placeholder="Ex. 4000"
              onChange={(e) => set("postal_code", e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_independent}
                onCheckedChange={(c) => set("is_independent", c === true)}
              />
              Indépendant·e
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.has_ev}
                onCheckedChange={(c) => set("has_ev", c === true)}
              />
              Véhicule électrique
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consommation énergie</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="elec_consumption_kwh"
            label="Électricité"
            value={form.elec_consumption_kwh}
            onChange={(v) => set("elec_consumption_kwh", v)}
            placeholder="Ex. 3500"
            suffix="kWh/an"
          />
          <NumberField
            id="gas_consumption_kwh"
            label="Gaz"
            value={form.gas_consumption_kwh}
            onChange={(v) => set("gas_consumption_kwh", v)}
            placeholder="Ex. 12000"
            suffix="kWh/an"
          />
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Si vous ne connaissez pas ces chiffres, laissez vides : Conso360 les
            estimera à partir de votre profil.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Télécom</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="internet_usage"
            label="Usage internet"
            options={INTERNET_USAGE}
            value={form.internet_usage}
            onChange={(v) => set("internet_usage", v)}
          />
          <NumberField
            id="gsm_count"
            label="Cartes SIM / GSM"
            value={form.gsm_count}
            onChange={(v) => set("gsm_count", v)}
            placeholder="Ex. 2"
          />
        </CardContent>
      </Card>

      <CardFooter className="justify-end px-0">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer mon profil"}
        </Button>
      </CardFooter>
    </form>
  );
}
