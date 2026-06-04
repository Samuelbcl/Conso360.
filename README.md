# Conso360

> *Un seul tableau de bord pour réduire toutes vos factures.*

Plateforme web (Belgique) qui permet aux particuliers de **comparer, suivre et optimiser** leurs contrats d'**énergie**, **télécom** et **assurances** en fonction de leur situation réelle, via 3 formules adaptatives.

---

## Les 3 formules

| Formule | Nom | Cœur de l'offre | Prix indicatif |
|---|---|---|---|
| **1** | Comparateur simple | Consulter les offres du marché, filtrer par profil, estimer les économies | Gratuit (affiliation/pub) ou 2–5 €/mois |
| **2** | Comparateur personnalisé | Compte client, encodage des contrats, upload de factures PDF, comparaison auto, alertes meilleures offres | 5–10 €/mois |
| **3** | Audit & Accompagnement Premium | Tout F1 + F2 + audit annuel, conseiller dédié, gestion du changement, assistance | 15–30 €/mois ou 150–300 €/an |

Détail complet dans [`BRIEF.md`](./BRIEF.md).

---

## Stack technique

- **Framework** : Next.js 16 (App Router) + TypeScript strict + React 19
- **UI** : Tailwind CSS v4 + shadcn/ui (style `base-nova`, sur **Base UI**)
- **Backend / DB / Auth / Storage** : Supabase (PostgreSQL, RLS) — région EU
- **Validation** : Zod v4 (toutes les entrées)
- **Paiements / abonnements** : Stripe (Billing + webhooks) — *Phase 4*
- **Parsing factures PDF** : à brancher (OCR/extraction → `parsed_data` JSON) — *Phase 3*
- **Tests** : Vitest
- **Déploiement cible** : Vercel (front) + Supabase (managed)

> Note : le BRIEF a été rédigé pour Next 15 ; le scaffold utilise **Next 16** (latest stable),
> les patterns App Router décrits restent valables.

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Variables d'environnement
#    .env.local existe déjà avec des PLACEHOLDERS (build/dev OK sans backend).
#    Remplacer par les vraies clés Supabase une fois le projet EU créé.
#    Référence des variables : .env.example

# 3. Base de données Supabase (quand le projet existe)
#    Appliquer les migrations via le SQL Editor ou la CLI :
#      supabase/migrations/0001_init.sql      (schéma + RLS)
#      supabase/migrations/0002_seed_example.sql  (offres d'exemple, is_example=true)
#    Puis régénérer les types :
#      npx supabase gen types typescript --project-id <ref> > src/types/database.ts

# 4. Lancer en dev
npm run dev          # http://localhost:3000

# Qualité
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # build de production
npm run test         # vitest
```

---

## Structure du dépôt

```
conso360/
├── README.md · BRIEF.md · ROADMAP.md   ← doc produit / plan de build
├── .env.example · .env.local           ← variables (placeholders en dev)
├── docs/                               ← DATA-MODEL · COMPARISON-ENGINE · LEGAL-BE
├── supabase/migrations/                ← 0001_init.sql (schéma+RLS), 0002_seed_example.sql
└── src/
    ├── app/
    │   ├── (marketing)/        ← landing publique « / »
    │   ├── (auth)/             ← login / signup (+ actions Server)
    │   ├── (app)/              ← espace client protégé (dashboard, profil-menage)
    │   └── auth/               ← routes callback / confirm (OTP, PKCE)
    ├── components/             ← auth-form, household-form, sign-out, ui/ (shadcn)
    ├── lib/
    │   ├── supabase/           ← clients server/client + session proxy
    │   ├── validations/        ← schémas Zod (auth, household)
    │   └── constants.ts
    ├── types/                  ← types domaine (à régénérer depuis Supabase)
    └── proxy.ts                ← middleware Next 16 (refresh session + protection routes)
```

---

## État du build

- ✅ **Phase 1** — Scaffold + Auth (e-mail/mot de passe + magic link) + clients Supabase
  + protection des routes + **formulaire profil ménage** (`households`).
  *Backend Supabase à brancher (placeholders en place).* `typecheck` / `lint` / `build` verts.
- 🔲 **Phase 2+** — voir [`ROADMAP.md`](./ROADMAP.md).

---

## Roadmap résumée

- **MVP** : énergie uniquement, espace client, upload facture, rapport PDF d'économies, Formules 1 + 2.
- **V1** : ajout télécom + assurances, alertes, Stripe complet.
- **V2** : Formule 3 (audit, conseiller, suivi du changement, affiliation/commissions).

Voir [`ROADMAP.md`](./ROADMAP.md).
