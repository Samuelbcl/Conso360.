# ROADMAP — Conso360

État : 🔲 à faire · 🟡 en cours · ✅ fait

## MVP (objectif : tester le marché vite)
Périmètre : **énergie uniquement**, Formules 1 + 2.

- ✅ Scaffold Next.js 16 + Tailwind v4 + shadcn (Base UI) + Supabase clients
- ✅ Auth (signup / login / magic link + routes callback & confirm)
- 🟡 Schéma DB appliqué (`0001_init.sql`) + RLS — *SQL prêt ; à appliquer une fois le projet Supabase EU créé*
- ✅ Formulaire profil ménage (`households`, Server Action + Zod)
- ✅ Seed fournisseurs + offres énergie (exemples) — migrations `0002` + `0003_seed_energy_offers.sql`
- ✅ Moteur de comparaison énergie + tests (`src/server/comparison`, 10 tests Vitest verts)
- ✅ Comparateur F1 (`/comparateur` : saisie rapide → offres classées + économie estimée)
- 🔲 Encodage contrats énergie (F2)
- 🔲 Upload facture PDF → Storage + `invoices`
- 🔲 Comparaison auto + persistance
- 🔲 Rapport PDF d'économies
- ✅ Landing + page pricing 3 formules (`/`, `/pricing`)

**Budget de dev estimé (réf. brief initial)** : MVP 8 000–20 000 € · plateforme complète 30 000–100 000 €.

## V1
- 🔲 Stripe Billing (3 tiers) + webhook + gating serveur
- 🔲 Alertes meilleures offres (cron)
- 🔲 Ajout catégorie **télécom**
- 🔲 Ajout catégorie **assurances**
- 🔲 Tableau de bord consolidé multi-catégories

## V2 — Formule 3
- 🔲 Conseillers (`advisors`) + assignation
- 🔲 Workflow audit annuel
- 🔲 Suivi du changement de fournisseur (statuts dossier)
- 🔲 Affiliation / commissions (`affiliate_events`)
- 🔲 Assistance téléphonique (process + outillage)

## Avant lancement commercial
- 🔲 Validation juridique BE (FSMA si courtage, RGPD, transparence affiliation) — voir `docs/LEGAL-BE.md`
- 🔲 Source de données tarifaires réelle (partenariat / API / scraping conforme)
- 🔲 Mentions légales, CGU, politique de confidentialité
- 🔲 Hébergement Supabase région EU confirmé

---

## Prochaine étape (à brancher par l'utilisateur)
1. Créer le projet **Supabase (région EU)** → récupérer URL + clés → remplir `.env.local`.
2. Appliquer `supabase/migrations/0001_init.sql` puis `0002_seed_example.sql`.
3. (Optionnel) Initialiser **git/GitHub** pour versionner.
→ Ensuite : **Phase 2** (seed offres énergie réelles d'exemple + moteur de comparaison + tests).
