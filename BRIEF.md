# BRIEF.md — Master Prompt Claude Code

> **Comment utiliser ce fichier** : ouvre le dossier dans VS Code, lance Claude Code, et demande-lui de suivre ce brief **phase par phase**. Ne pas tout générer d'un coup : on valide chaque phase avant de passer à la suivante. À chaque démarrage de session, relis ce fichier + `ROADMAP.md`.

---

## 0. Contexte & objectif produit

On construit **Conso360**, une plateforme web belge où un particulier peut **comparer, suivre et optimiser** ses contrats d'**énergie** (élec + gaz), **télécom** (internet/mobile) et **assurances**.

Le différenciateur vs Test-Achats / comparateurs classiques : ce n'est pas un comparateur ponctuel, mais un **service de suivi continu** (« le coach personnel des dépenses du ménage »). On accompagne le client dans la durée et on l'alerte quand une meilleure offre apparaît.

Trois formules adaptatives (voir §3). Le code doit être pensé pour que les fonctionnalités de la Formule 1 soient un sous-ensemble de la 2, et la 2 un sous-ensemble de la 3 (gating par `plan_tier`).

---

## 1. Stack & conventions

- **Next.js 15** (App Router), **TypeScript** strict, **Server Components** par défaut, Server Actions pour les mutations simples.
- **Tailwind CSS** + **shadcn/ui** (composants accessibles, thème cohérent).
- **Supabase** : Postgres + Auth (email + magic link / OAuth Google) + Storage (factures PDF) + RLS systématique.
- **Stripe** : Billing pour les abonnements (3 produits = 3 tiers), webhooks pour synchroniser `subscriptions`.
- **Validation** : Zod sur toutes les entrées.
- **i18n** : FR par défaut (marché belge francophone), prévoir NL plus tard — externaliser les textes.
- Conventions : `src/app/...`, `src/components/...`, `src/lib/...`, `src/server/...` (logique métier), `src/types/...`.
- Pas de secrets en dur. Tout passe par `.env.local` (voir `.env.example`).
- Commits clairs, petits, par fonctionnalité.

---

## 2. Architecture cible (dossiers)

```
src/
├── app/
│   ├── (marketing)/            ← landing, pricing, pages publiques
│   ├── (auth)/                 ← login, signup, callback
│   ├── (app)/                  ← espace client protégé
│   │   ├── dashboard/
│   │   ├── profil-menage/      ← formulaire situation (conso, logement, GSM…)
│   │   ├── contrats/           ← encodage + upload factures (F2)
│   │   ├── comparateur/        ← résultats de comparaison (F1/F2)
│   │   ├── alertes/            ← (F2)
│   │   ├── audit/              ← (F3)
│   │   └── abonnement/         ← gestion Stripe
│   └── api/
│       ├── stripe/webhook/
│       └── ...
├── components/
├── lib/
│   ├── supabase/               ← clients server/client
│   ├── stripe/
│   └── pdf/                     ← génération rapport PDF + parsing factures
├── server/
│   ├── comparison/             ← MOTEUR DE COMPARAISON (voir docs/COMPARISON-ENGINE.md)
│   ├── providers/              ← accès offres/fournisseurs
│   └── billing/
└── types/
```

---

## 3. Les 3 formules (gating par `plan_tier`)

### Formule 1 — Comparateur simple (`tier = free` ou `basic`)
- Consulter les offres énergie / télécom / assurance du marché.
- Filtres par profil : taille du ménage, célibataire/famille, propriétaire/locataire, indépendant, véhicule électrique, etc.
- **Estimation rapide** des économies à partir de quelques champs (sans compte obligatoire pour F1 gratuite).
- Monétisation : affiliation / pub, ou abonnement léger 2–5 €/mois.

### Formule 2 — Comparateur personnalisé (`tier = plus`)
- Compte client obligatoire.
- Encodage des **contrats actuels** par catégorie.
- **Upload de factures PDF** → extraction des données clés (`invoices.parsed_data`).
- Historique des tarifs.
- **Comparaison automatique** avec les concurrents (moteur, §moteur).
- **Alertes** quand une meilleure offre apparaît.
- Rapport PDF d'économies.
- Prix : 5–10 €/mois.

### Formule 3 — Audit & Accompagnement Premium (`tier = premium`)
- Tout F1 + F2.
- **Audit annuel** de tous les contrats.
- **Conseiller dédié** (table `advisors`, assignation).
- **Gestion administrative du changement** de fournisseur (suivi de dossier, statuts).
- Assistance téléphonique.
- Optimisation régulière.
- Prix : 15–30 €/mois ou 150–300 €/an.

> **Important** : implémenter le gating côté serveur (jamais uniquement côté UI). Une route F2/F3 doit vérifier `plan_tier` dans `subscriptions` avant de servir la donnée.

---

## 4. Moteur de comparaison

Voir `docs/COMPARISON-ENGINE.md` pour la spec détaillée. En résumé, à partir du profil ménage + contrats actuels, le moteur calcule :
- **coût actuel annuel**,
- **meilleure offre disponible** par catégorie,
- **économie potentielle annuelle**,
- **ROI / temps de retour** (utile quand un changement implique des frais).

Le moteur doit être **pur et testé** (`src/server/comparison/`), indépendant de Next.js, avec des fonctions typées et des tests unitaires sur des cas connus.

---

## 5. Modèle de données

Schéma complet dans `supabase/migrations/0001_init.sql` et décrit dans `docs/DATA-MODEL.md`. Tables principales :

`profiles`, `households`, `providers`, `offers`, `contracts`, `invoices`, `comparisons`, `savings_reports`, `alerts`, `subscriptions`, `audits`, `advisors`, `affiliate_events`.

**RLS** : chaque utilisateur ne voit que ses propres lignes. `providers` et `offers` = lecture publique. Tout le reste = scoping par `user_id`.

---

## 6. Sources de revenus à coder (sans tout activer au MVP)

1. **Abonnements** (Stripe, 3 tiers).
2. **Commissions d'affiliation** : table `affiliate_events` (clic + conversion + montant). Énergie ~20–100 €, télécom ~20–80 €, assurance ~30–150 € par changement.
3. **Services complémentaires** (F3) : audit, conseil budgétaire, assistance, courtage.

---

## 7. Cadre légal belge — À NE PAS IGNORER

Voir `docs/LEGAL-BE.md`. Points critiques à garder en tête dès la conception :

- **Courtage en assurance** : activité réglementée par la **FSMA**. Faire de la simple comparaison/affiliation ≠ courtage. Le rôle « courtier » de la Formule 3 nécessite très probablement un **agrément FSMA** (ou un partenariat avec un courtier agréé). → Tant que ce n'est pas réglé, **ne pas se présenter comme courtier** ; rester « comparateur + mise en relation ».
- **Intermédiation énergie** : encadrement par les régulateurs (**CREG** + régionaux **CWaPE**/Wallonie, **VREG**/Flandre, **Brugel**/Bruxelles). Les comparateurs officiels existent (CompaCWaPE, V-test, Brusim) → on se positionne en **service de suivi**, pas en autorité tarifaire.
- **Télécom** : régulateur **BIPT** (comparateur officiel meilleurtarif.be / bestetarief.be).
- **RGPD** : données sensibles (factures, conso, contrats). Minimisation, consentement explicite, droit à l'effacement, hébergement EU. Supabase région EU obligatoire. Documenter le traitement.
- **Affiliation** : transparence obligatoire sur la rémunération (mention claire que le service touche une commission).

> ⚠️ Ces points sont des repères de cadrage, pas un avis juridique. À faire valider par un juriste belge avant lancement commercial (surtout F3 / courtage).

---

## 8. Plan d'exécution (à suivre dans l'ordre)

### Phase 1 — Scaffold + Auth + DB
1. `create-next-app` (TS, App Router, Tailwind, ESLint).
2. Installer shadcn/ui, Supabase client (`@supabase/ssr`), Zod, Stripe.
3. Brancher Supabase (clients server/client), appliquer `0001_init.sql`.
4. Auth (signup/login/magic link + callback), layout `(app)` protégé.
5. Page profil ménage (formulaire `households`).

### Phase 2 — Comparateur F1 (énergie d'abord)
1. Seed `providers` + `offers` énergie (quelques fournisseurs réels belges).
2. Moteur de comparaison énergie (`src/server/comparison/energy.ts`) + tests.
3. UI comparateur : saisie rapide → résultats triés + économie estimée.
4. Landing + pricing (3 formules).

### Phase 3 — Espace client F2 (énergie)
1. Encodage `contracts` énergie.
2. Upload facture PDF → Storage + `invoices` (parsing en stub d'abord, JSON manuel/assisté ensuite).
3. Comparaison auto contrat actuel vs marché + persistance `comparisons`.
4. **Rapport PDF d'économies** (lib/pdf).
5. Alertes (job/cron : nouvelle offre meilleure → `alerts`).

### Phase 4 — Stripe + gating
1. 3 produits/prix Stripe = 3 tiers.
2. Checkout + portail client.
3. Webhook → sync `subscriptions`.
4. Gating serveur des routes F2/F3.

### Phase 5 — Extension catégories
1. Ajouter **télécom**, puis **assurances** (mêmes patterns).
2. Tableau de bord consolidé multi-catégories.

### Phase 6 — Formule 3
1. `advisors` + assignation conseiller.
2. Workflow audit annuel.
3. Suivi du changement de fournisseur (statuts de dossier).
4. `affiliate_events` (clic → conversion → commission).

---

## 9. Définition de « terminé » (par phase)

- Code typé, lint OK, build OK.
- RLS testées (un user ne lit pas les données d'un autre).
- Le moteur de comparaison a des tests unitaires verts.
- Pas de secret commité.
- README/ROADMAP mis à jour avec l'état réel.

---

## 10. Garde-fous pour Claude Code

- Ne jamais inventer des chiffres tarifaires réels : seed avec des données **clairement marquées comme exemples** tant qu'on n'a pas branché de vraie source.
- Toujours valider les entrées (Zod) et scoper par `user_id`.
- Préférer des modules métier purs et testables au couplage avec le framework.
- Demander confirmation avant : migrations destructives, suppression de données, changements de schéma Stripe.
