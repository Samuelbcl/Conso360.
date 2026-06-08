import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ComparisonResult } from "@/server/comparison";
import type { Comparison } from "@/types/database";

/** Format monétaire compatible WinAnsi (espaces normaux, "EUR" au lieu de €). */
const money = (n: number) =>
  `${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} EUR`;

export async function buildSavingsReportPdf(opts: {
  name: string;
  dateLabel: string;
  comparison: Comparison;
}): Promise<Uint8Array> {
  const { name, dateLabel, comparison } = opts;
  const result = comparison.result as unknown as ComparisonResult | undefined;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const left = 56;
  let y = 790;
  const ink = rgb(0.1, 0.1, 0.12);
  const muted = rgb(0.45, 0.45, 0.5);
  const green = rgb(0.07, 0.5, 0.3);

  const line = (
    text: string,
    size = 11,
    f = font,
    color = ink,
    dy = 18,
  ) => {
    page.drawText(text, { x: left, y, size, font: f, color });
    y -= dy;
  };

  // En-tête
  line("Conso360", 22, bold);
  line("Rapport d'economies - energie", 13, font, muted, 26);
  line(`Etabli pour : ${name}`, 11, font, ink, 16);
  line(`Date : ${dateLabel}`, 11, font, muted, 30);

  // Situation actuelle
  line("Votre situation", 13, bold, ink, 22);
  line(
    comparison.current_cost_annual !== null
      ? `Cout actuel estime : ${money(comparison.current_cost_annual)} / an`
      : "Cout actuel non renseigne (estimation basee sur votre profil).",
    11,
    font,
    ink,
    28,
  );

  // Meilleure offre
  line("Meilleure offre du marche", 13, bold, ink, 22);
  if (result?.best) {
    line(`${result.best.providerName} - ${result.best.offerName}`, 11, bold);
    line(`${money(result.best.annualCost)} / an`, 11, font, ink, 28);
  } else {
    line("Aucune offre exploitable pour le moment.", 11, font, muted, 28);
  }

  // Economie
  const savings = comparison.savings_annual;
  if (savings !== null && savings > 0) {
    line("Economie annuelle estimee", 13, bold, ink, 22);
    line(money(savings), 26, bold, green, 30);
    if (comparison.roi_months !== null) {
      line(`Retour sur frais de changement : ~${comparison.roi_months} mois`, 10, font, muted, 26);
    }
  } else {
    line("Votre contrat est deja competitif.", 12, bold, ink, 28);
  }

  // Classement (top 5)
  if (result?.ranked?.length) {
    line("Classement des offres", 13, bold, ink, 20);
    result.ranked.slice(0, 5).forEach((o, i) => {
      line(
        `${i + 1}. ${o.providerName} - ${o.offerName} : ${money(o.annualCost)} / an`,
        10,
        font,
        ink,
        16,
      );
    });
    y -= 10;
  }

  // Disclaimer
  const disclaimer = [
    "Tarifs d'exemple, non contractuels. Conso360 est un service de comparaison",
    "et de suivi : ni autorite tarifaire, ni courtier agree. Verifiez les conditions",
    "aupres du fournisseur avant tout changement.",
  ];
  y = Math.min(y, 120);
  disclaimer.forEach((d) => line(d, 8.5, font, muted, 12));

  return doc.save();
}
