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
- ✅ Encodage contrats énergie (F2) — `/contrats` (CRUD + Zod)
- ✅ Upload facture PDF → Storage + `invoices` (parsing en stub) — migration `0004` (bucket + RLS)
- ✅ Comparaison auto contrat vs marché + persistance (`comparisons`)
- ✅ Rapport PDF d'économies (`/contrats/rapport`, pdf-lib) + `savings_reports`
- ✅ Landing + page pricing 3 formules (`/`, `/pricing`)

**Budget de dev estimé (réf. brief initial)** : MVP 8 000–20 000 € · plateforme complète 30 000–100 000 €.

## V1
- 🔲 Stripe Billing (3 tiers) + webhook + gating serveur
- 🟡 Alertes meilleures offres — déclenchement manuel fait (`/alertes`) ; automatisation cron à venir
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

## État au terme des phases 1 → 3
- ✅ Supabase branché (clés en place), migrations `0001`–`0003` appliquées.
- ✅ Auth, profil ménage, comparateur énergie, contrats, comparaison persistée,
  rapport PDF, alertes (manuel). Build/lint/typecheck + 10 tests verts. Tout sur GitHub.

### Action utilisateur en attente
- ⏳ Exécuter `supabase/migrations/0004_storage_invoices.sql` dans le SQL Editor
  (bucket `invoices` + RLS) pour activer l'upload de factures.

### Prochaines pistes
- **V1** : Stripe Billing (3 tiers) + gating serveur ; cron alertes ; télécom puis assurances.
- Parsing réel des factures (OCR) ; source tarifaire vérifiée (remplacer les `is_example`).
