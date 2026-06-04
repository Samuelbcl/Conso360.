# Modèle de données — Conso360

Schéma SQL source : [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

## Vue d'ensemble

```
auth.users
   │
   ├─ profiles (1:1)            plan_tier, full_name, phone
   ├─ households (1:N)          situation du ménage (conso, logement, GSM…)
   ├─ contracts (1:N)           contrats actuels par catégorie
   │     └─ invoices (1:N)      factures PDF rattachées
   ├─ comparisons (1:N)         résultats du moteur
   ├─ savings_reports (1:N)     rapports PDF
   ├─ alerts (1:N)              meilleures offres détectées
   ├─ subscriptions (1:1)       état Stripe + tier
   ├─ audits (1:N)              Formule 3
   └─ affiliate_events (1:N)    clics / conversions / commissions

providers (public) ─< offers (public)
advisors (interne) ─< audits
```

## Tables

| Table | Rôle | Scope RLS |
|---|---|---|
| `profiles` | Profil utilisateur, `plan_tier` (free/basic/plus/premium) | self |
| `households` | Situation du ménage (taille, logement, conso élec/gaz, internet, GSM, VE, région) | owner |
| `providers` | Fournisseurs énergie / télécom / assurance + infos affiliation | lecture publique |
| `offers` | Offres/tarifs d'un fournisseur. `price_structure` et `conditions` en JSON. `is_example=true` tant qu'aucune source réelle | lecture publique |
| `contracts` | Contrats actuels du client (coût mensuel/annuel, renouvellement, détails JSON) | owner |
| `invoices` | Factures PDF (Storage) + `parsed_data` extrait | owner |
| `comparisons` | Résultat moteur : coût actuel, meilleure offre, économie, ROI, classement complet | owner |
| `savings_reports` | Rapports PDF d'économies | owner |
| `alerts` | Notifications « meilleure offre disponible » | owner |
| `subscriptions` | Lien Stripe ↔ tier, statut, fin de période | owner |
| `advisors` | Conseillers internes (Formule 3) | interne |
| `audits` | Demandes/suivi d'audit annuel (Formule 3) | owner |
| `affiliate_events` | Clics et conversions → commissions | owner |

## Champs JSON typés (à modéliser côté TS avec Zod)

**`offers.price_structure`** (exemple énergie) :
```json
{
  "abonnement_annuel": 95.0,
  "prix_kwh_elec": 0.32,
  "prix_kwh_gaz": 0.09,
  "tarif_type": "fixe",
  "duree_engagement_mois": 12
}
```

**`households`** → sert d'entrée au moteur de comparaison (voir `COMPARISON-ENGINE.md`).

**`invoices.parsed_data`** : structure normalisée après extraction OCR/PDF (consommation, période, montants, fournisseur détecté).

## Notes d'implémentation
- `plan_tier` est dupliqué dans `profiles` (lecture rapide) et la source de vérité reste `subscriptions` (synchronisée par le webhook Stripe). Le webhook met à jour les deux.
- Toujours scoper les requêtes par `auth.uid()` côté serveur **en plus** de la RLS (défense en profondeur).
- `offers.is_example` : garde-fou pour ne jamais afficher de faux tarifs comme réels en prod.
