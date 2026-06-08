/** Formatage monétaire belge (EUR). */
export const eur = (n: number) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const eur2 = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(n);

export const kwh = (n: number) =>
  `${new Intl.NumberFormat("fr-BE").format(Math.round(n))} kWh`;
