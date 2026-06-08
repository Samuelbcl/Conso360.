-- =============================================================
-- STORAGE — bucket privé « invoices » (factures PDF) + RLS
-- À exécuter dans le SQL Editor Supabase.
-- Chaque utilisateur n'accède qu'à ses fichiers (dossier = son user_id).
-- =============================================================

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Upload : seulement dans son propre dossier (premier segment du chemin = uid)
do $$ begin
  create policy "invoices insert own"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'invoices'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null; end $$;

-- Lecture de ses propres fichiers
do $$ begin
  create policy "invoices select own"
    on storage.objects for select to authenticated
    using (
      bucket_id = 'invoices'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null; end $$;

-- Suppression de ses propres fichiers
do $$ begin
  create policy "invoices delete own"
    on storage.objects for delete to authenticated
    using (
      bucket_id = 'invoices'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when duplicate_object then null; end $$;
