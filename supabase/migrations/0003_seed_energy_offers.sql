-- =============================================================
-- SEED — fournisseurs & offres ÉNERGIE (jeu enrichi)
-- ⚠️ DONNÉES D'EXEMPLE (is_example = true) — tarifs NON CONTRACTUELS,
--    à remplacer par une source vérifiée (régulateurs / partenaire).
-- Idempotent : ré-exécutable sans créer de doublons.
-- =============================================================

-- ---- Fournisseurs (noms réels, tarifs d'exemple) ----
insert into providers (category, name, website, active)
select v.category::category, v.name, v.website, true
from (values
  ('energy', 'Engie',          'https://www.engie.be'),
  ('energy', 'Luminus',        'https://www.luminus.be'),
  ('energy', 'TotalEnergies',  'https://www.totalenergies.be'),
  ('energy', 'Mega',           'https://www.mega.be'),
  ('energy', 'Eneco',          'https://www.eneco.be'),
  ('energy', 'Octa+',          'https://www.octaplus.be')
) as v(category, name, website)
where not exists (
  select 1 from providers p
  where p.name = v.name and p.category = v.category::category
);

-- ---- Offres (rattachées par nom de fournisseur) ----
insert into offers (provider_id, category, name, description, price_structure, is_example, active)
select p.id, 'energy', o.offer_name, o.descr, o.ps, true, true
from (values
  ('Engie',         'Easy Fixe 1 an',     'Tarif fixe 12 mois — exemple non contractuel',
     '{"abonnement_annuel":85,"prix_kwh_elec":0.31,"prix_kwh_gaz":0.085,"tarif_type":"fixe","duree_engagement_mois":12}'::jsonb),
  ('Engie',         'Drive Variable',     'Tarif variable — exemple non contractuel',
     '{"abonnement_annuel":80,"prix_kwh_elec":0.29,"prix_kwh_gaz":0.082,"tarif_type":"variable","duree_engagement_mois":12}'::jsonb),
  ('Luminus',       'Comfy Fixe',         'Tarif fixe 12 mois — exemple non contractuel',
     '{"abonnement_annuel":92,"prix_kwh_elec":0.30,"prix_kwh_gaz":0.088,"tarif_type":"fixe","duree_engagement_mois":12}'::jsonb),
  ('Luminus',       'EnergyFlex',         'Tarif variable — exemple non contractuel',
     '{"abonnement_annuel":78,"prix_kwh_elec":0.295,"prix_kwh_gaz":0.080,"tarif_type":"variable","duree_engagement_mois":12}'::jsonb),
  ('TotalEnergies', 'Pixel Fixe',         'Tarif fixe 12 mois — exemple non contractuel',
     '{"abonnement_annuel":75,"prix_kwh_elec":0.305,"prix_kwh_gaz":0.083,"tarif_type":"fixe","duree_engagement_mois":12}'::jsonb),
  ('TotalEnergies', 'Verygreen Variable', 'Tarif variable vert — exemple non contractuel',
     '{"abonnement_annuel":70,"prix_kwh_elec":0.285,"prix_kwh_gaz":0.079,"tarif_type":"variable","duree_engagement_mois":12}'::jsonb),
  ('Mega',          'Online Fixe',        'Tarif fixe en ligne — exemple non contractuel',
     '{"abonnement_annuel":60,"prix_kwh_elec":0.275,"prix_kwh_gaz":0.075,"tarif_type":"fixe","duree_engagement_mois":12}'::jsonb),
  ('Mega',          'Flow Variable',      'Tarif variable — exemple non contractuel',
     '{"abonnement_annuel":55,"prix_kwh_elec":0.265,"prix_kwh_gaz":0.072,"tarif_type":"variable","duree_engagement_mois":12}'::jsonb),
  ('Eneco',         'Soleil Fixe',        'Tarif fixe 12 mois — exemple non contractuel',
     '{"abonnement_annuel":95,"prix_kwh_elec":0.32,"prix_kwh_gaz":0.09,"tarif_type":"fixe","duree_engagement_mois":12}'::jsonb),
  ('Octa+',         'Clear Variable',     'Tarif variable — exemple non contractuel',
     '{"abonnement_annuel":88,"prix_kwh_elec":0.30,"prix_kwh_gaz":0.084,"tarif_type":"variable","duree_engagement_mois":12}'::jsonb)
) as o(provider_name, offer_name, descr, ps)
join providers p on p.name = o.provider_name and p.category = 'energy'
where not exists (
  select 1 from offers ex where ex.name = o.offer_name and ex.provider_id = p.id
);
