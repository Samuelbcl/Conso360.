-- =============================================================
-- SEED EXEMPLE — fournisseurs & offres énergie
-- ⚠️ DONNÉES D'EXEMPLE (is_example = true). NE PAS afficher
--    comme tarifs réels. À remplacer par une source vérifiée.
-- =============================================================

insert into providers (id, category, name, website, active) values
  (gen_random_uuid(), 'energy', 'Fournisseur A (exemple)', 'https://example.be', true),
  (gen_random_uuid(), 'energy', 'Fournisseur B (exemple)', 'https://example.be', true),
  (gen_random_uuid(), 'energy', 'Fournisseur C (exemple)', 'https://example.be', true)
on conflict do nothing;

-- Offres d'exemple (rattacher via sous-requête sur le nom)
insert into offers (provider_id, category, name, description, price_structure, is_example, active)
select p.id, 'energy', 'Offre Fixe 12 mois (exemple)',
       'Tarif fixe sur 12 mois — données fictives',
       jsonb_build_object(
         'abonnement_annuel', 95.0,
         'prix_kwh_elec', 0.32,
         'prix_kwh_gaz', 0.09,
         'tarif_type', 'fixe',
         'duree_engagement_mois', 12
       ),
       true, true
from providers p
where p.name like 'Fournisseur %(exemple)' and p.category = 'energy';
