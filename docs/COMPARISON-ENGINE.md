# Moteur de comparaison — spec

Emplacement cible : `src/server/comparison/`. Le moteur est **pur** (pas de dépendance Next.js), typé, et **testé unitairement**.

## Principe

À partir de :
- le **profil ménage** (`households`),
- éventuellement le **contrat actuel** (`contracts`) ou les données de facture (`invoices.parsed_data`),
- la liste des **offres actives** (`offers`) d'une catégorie,

le moteur calcule pour chaque catégorie (énergie, télécom, assurance) :

1. **Coût actuel annuel** — soit lu sur le contrat/facture, soit estimé depuis le profil.
2. **Coût annuel de chaque offre du marché** — appliqué au profil de consommation.
3. **Meilleure offre** (coût le plus bas, à conditions comparables).
4. **Économie potentielle annuelle** = coût actuel − meilleur coût.
5. **ROI / temps de retour** = (frais de changement éventuels) / (économie mensuelle). En mois.

## Interface (TypeScript)

```ts
// src/server/comparison/types.ts
export interface HouseholdProfile {
  householdSize?: number;
  housingType?: string;
  ownership?: 'proprietaire' | 'locataire';
  hasEv?: boolean;
  region?: 'wallonie' | 'flandre' | 'bruxelles';
  elecConsumptionKwh?: number;
  gasConsumptionKwh?: number;
  internetUsage?: 'leger' | 'moyen' | 'intensif';
  gsmCount?: number;
}

export interface OfferInput {
  id: string;
  providerId: string;
  name: string;
  priceStructure: Record<string, number | string>;
}

export interface OfferResult {
  offerId: string;
  providerName: string;
  annualCost: number;
}

export interface ComparisonResult {
  category: 'energy' | 'telecom' | 'insurance';
  currentCostAnnual: number | null;
  ranked: OfferResult[];        // trié croissant par annualCost
  best: OfferResult | null;
  savingsAnnual: number | null; // null si pas de coût actuel
  roiMonths: number | null;
}
```

## Calcul énergie (MVP)

```
coût annuel offre =
    abonnement_annuel
  + (elecConsumptionKwh * prix_kwh_elec)
  + (gasConsumptionKwh  * prix_kwh_gaz)
```

> Affiner ensuite : tarifs jour/nuit, prosumer (panneaux + VE), TVA, contributions régionales. Garder ces raffinements derrière des fonctions séparées pour rester testable.

## Estimation sans facture (Formule 1)

Si le client n'a pas de contrat encodé, estimer `elecConsumptionKwh` / `gasConsumptionKwh` à partir d'abaques par profil (taille ménage, type logement, VE oui/non). Mettre ces abaques dans un fichier de constantes documenté et facile à corriger.

## Télécom / Assurance

Même squelette, `price_structure` adapté :
- **Télécom** : forfait mensuel selon usage internet + nb de cartes SIM/GSM ; bundles.
- **Assurance** : prime annuelle selon profil/garanties. ⚠️ comparaison plus délicate (garanties non homogènes) — comparer à **garanties équivalentes**, sinon le résultat est trompeur.

## Tests à prévoir

- Cas profil moyen wallon → vérifie tri croissant et best correct.
- Coût actuel > meilleure offre → `savingsAnnual` positif.
- Coût actuel < toutes les offres → `best` quand même retourné, `savingsAnnual` ≤ 0.
- Profil sans gaz → `gasConsumptionKwh = 0` n'ajoute rien.
- Offre incomplète (champ manquant) → ne crashe pas, écarte l'offre proprement.
