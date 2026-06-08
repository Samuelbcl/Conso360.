import { describe, expect, it } from "vitest";
import { compareEnergy, energyOfferAnnualCost } from "./energy";
import type { HouseholdProfile, OfferInput } from "./types";

const offers: OfferInput[] = [
  {
    id: "o1",
    providerId: "p1",
    providerName: "Alpha",
    name: "Fixe 12 mois",
    priceStructure: { abonnement_annuel: 95, prix_kwh_elec: 0.32, prix_kwh_gaz: 0.09 },
  },
  {
    id: "o2",
    providerId: "p2",
    providerName: "Beta",
    name: "Variable",
    priceStructure: { abonnement_annuel: 80, prix_kwh_elec: 0.3, prix_kwh_gaz: 0.1 },
  },
  {
    id: "o3",
    providerId: "p3",
    providerName: "Gamma",
    name: "Eco",
    priceStructure: { abonnement_annuel: 120, prix_kwh_elec: 0.28, prix_kwh_gaz: 0.08 },
  },
];

// Profil moyen avec conso connue : o1=2295, o2=2330, o3=2060.
const profile: HouseholdProfile = {
  region: "wallonie",
  householdSize: 3,
  elecConsumptionKwh: 3500,
  gasConsumptionKwh: 12000,
};

describe("energyOfferAnnualCost", () => {
  it("calcule abo + élec + gaz", () => {
    expect(energyOfferAnnualCost(offers[0], 3500, 12000)).toBe(2295);
  });

  it("écarte une offre incomplète (prix élec manquant alors que conso élec > 0)", () => {
    const incomplete: OfferInput = {
      id: "x",
      providerId: "p",
      providerName: "X",
      name: "Sans prix élec",
      priceStructure: { abonnement_annuel: 50, prix_kwh_gaz: 0.09 },
    };
    expect(energyOfferAnnualCost(incomplete, 3500, 12000)).toBeNull();
  });

  it("n'ajoute rien pour le gaz si la conso gaz est nulle", () => {
    // offre sans prix gaz, mais gasKwh = 0 → non écartée
    const elecOnly: OfferInput = {
      id: "e",
      providerId: "p",
      providerName: "E",
      name: "Élec seule",
      priceStructure: { abonnement_annuel: 100, prix_kwh_elec: 0.25 },
    };
    expect(energyOfferAnnualCost(elecOnly, 3500, 0)).toBe(100 + 3500 * 0.25);
  });
});

describe("compareEnergy", () => {
  it("trie par coût croissant et identifie la meilleure offre", () => {
    const r = compareEnergy(profile, offers);
    expect(r.ranked.map((o) => o.offerId)).toEqual(["o3", "o1", "o2"]);
    expect(r.best?.offerId).toBe("o3");
    expect(r.best?.annualCost).toBe(2060);
    expect(r.estimated).toBe(false);
  });

  it("économie positive quand le coût actuel dépasse la meilleure offre", () => {
    const r = compareEnergy(profile, offers, { currentCostAnnual: 2500 });
    expect(r.savingsAnnual).toBe(440);
  });

  it("renvoie quand même best et une économie ≤ 0 si le coût actuel est plus bas que tout", () => {
    const r = compareEnergy(profile, offers, { currentCostAnnual: 1500 });
    expect(r.best?.offerId).toBe("o3");
    expect(r.savingsAnnual).toBeLessThanOrEqual(0);
    expect(r.savingsAnnual).toBe(-560);
  });

  it("ignore proprement les offres incomplètes (pas de crash)", () => {
    const withBad: OfferInput[] = [
      ...offers,
      {
        id: "bad",
        providerId: "pb",
        providerName: "Bad",
        name: "Incomplète",
        priceStructure: { abonnement_annuel: 10 }, // ni élec ni gaz
      },
    ];
    const r = compareEnergy(profile, withBad);
    expect(r.ranked.find((o) => o.offerId === "bad")).toBeUndefined();
    expect(r.ranked).toHaveLength(3);
  });

  it("estime la conso quand elle n'est pas fournie (estimated = true)", () => {
    const r = compareEnergy({ householdSize: 2, housingType: "appartement" }, offers);
    expect(r.estimated).toBe(true);
    expect(r.best).not.toBeNull();
  });

  it("calcule le ROI à partir des frais de changement", () => {
    const r = compareEnergy(profile, offers, {
      currentCostAnnual: 2500,
      switchingFees: 60,
    });
    // économie 440/an → 36,67/mois → 60/36,67 ≈ 1,6 mois
    expect(r.roiMonths).toBe(1.6);
  });

  it("gère l'absence d'offres", () => {
    const r = compareEnergy(profile, [], { currentCostAnnual: 2000 });
    expect(r.ranked).toEqual([]);
    expect(r.best).toBeNull();
    expect(r.savingsAnnual).toBeNull();
  });
});
