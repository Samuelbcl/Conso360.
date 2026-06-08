import { buildSavingsReportPdf } from "@/lib/pdf/savings-report";
import { createClient } from "@/lib/supabase/server";
import type { Comparison } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  const { data: comparison } = await supabase
    .from("comparisons")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", "energy")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Comparison>();

  if (!comparison) {
    return new Response(
      "Aucune comparaison disponible. Lancez d'abord une comparaison depuis vos contrats.",
      { status: 404 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle<{ full_name: string | null }>();

  const pdf = await buildSavingsReportPdf({
    name: profile?.full_name ?? user.email ?? "Client",
    dateLabel: new Date().toLocaleDateString("fr-BE"),
    comparison,
  });

  await supabase.from("savings_reports").insert({
    user_id: user.id,
    period: new Date().toISOString().slice(0, 10),
    total_savings: comparison.savings_annual,
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="rapport-economies-conso360.pdf"',
    },
  });
}
