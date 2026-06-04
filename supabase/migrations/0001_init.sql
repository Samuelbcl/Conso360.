-- =============================================================
-- Conso360 — Schéma initial (Supabase / PostgreSQL)
-- Migration 0001_init.sql
-- =============================================================
-- À appliquer via le SQL Editor Supabase ou `supabase db push`.
-- RLS activée partout : chaque user ne voit que ses lignes.
-- `providers` et `offers` = lecture publique.
-- =============================================================

-- ----- ENUMS --------------------------------------------------
do $$ begin
  create type plan_tier as enum ('free', 'basic', 'plus', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type category as enum ('energy', 'telecom', 'insurance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_status as enum ('new', 'read', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type affiliate_type as enum ('click', 'conversion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type audit_status as enum ('requested', 'scheduled', 'in_progress', 'done', 'cancelled');
exception when duplicate_object then null; end $$;

-- ----- PROFILES (extension de auth.users) --------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  plan_tier   plan_tier not null default 'free',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----- HOUSEHOLDS (situation du ménage) ----------------------
create table if not exists households (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  household_size      int,
  housing_type        text,          -- maison, appartement, studio...
  ownership           text,          -- proprietaire / locataire
  is_independent      boolean default false,
  has_ev              boolean default false,   -- véhicule électrique
  region              text,          -- wallonie / flandre / bruxelles
  postal_code         text,
  elec_consumption_kwh int,
  gas_consumption_kwh  int,
  internet_usage      text,          -- léger / moyen / intensif
  gsm_count           int,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_households_user on households(user_id);

-- ----- PROVIDERS (fournisseurs) ------------------------------
create table if not exists providers (
  id                uuid primary key default gen_random_uuid(),
  category          category not null,
  name              text not null,
  logo_url          text,
  website           text,
  affiliate_url     text,
  commission_amount numeric(10,2),   -- commission indicative par conversion
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);
create index if not exists idx_providers_category on providers(category);

-- ----- OFFERS (offres / tarifs) ------------------------------
create table if not exists offers (
  id              uuid primary key default gen_random_uuid(),
  provider_id     uuid not null references providers(id) on delete cascade,
  category        category not null,
  name            text not null,
  description     text,
  price_structure jsonb not null default '{}'::jsonb,  -- ex: {abonnement_annuel, prix_kwh, prix_m3...}
  conditions      jsonb not null default '{}'::jsonb,  -- durée engagement, options...
  is_example      boolean not null default true,       -- TRUE tant que pas de source réelle
  valid_from      date,
  valid_to        date,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists idx_offers_provider on offers(provider_id);
create index if not exists idx_offers_category on offers(category);

-- ----- CONTRACTS (contrats actuels du client) ---------------
create table if not exists contracts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category      category not null,
  provider_id   uuid references providers(id) on delete set null,
  provider_name text,                 -- saisie libre si fournisseur inconnu
  offer_name    text,
  monthly_cost  numeric(10,2),
  annual_cost   numeric(10,2),
  start_date    date,
  renewal_date  date,
  details       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_contracts_user on contracts(user_id);

-- ----- INVOICES (factures uploadées) ------------------------
create table if not exists invoices (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  contract_id  uuid references contracts(id) on delete set null,
  category     category not null,
  file_path    text not null,          -- chemin Supabase Storage
  parsed_data  jsonb not null default '{}'::jsonb,
  status       text not null default 'uploaded',  -- uploaded / parsed / failed
  uploaded_at  timestamptz not null default now()
);
create index if not exists idx_invoices_user on invoices(user_id);

-- ----- COMPARISONS (résultats de comparaison) ---------------
create table if not exists comparisons (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  household_id        uuid references households(id) on delete set null,
  category            category not null,
  current_cost_annual numeric(10,2),
  best_offer_id       uuid references offers(id) on delete set null,
  best_cost_annual    numeric(10,2),
  savings_annual      numeric(10,2),
  roi_months          numeric(6,1),
  result              jsonb not null default '{}'::jsonb,  -- classement complet
  created_at          timestamptz not null default now()
);
create index if not exists idx_comparisons_user on comparisons(user_id);

-- ----- SAVINGS REPORTS (rapports PDF) -----------------------
create table if not exists savings_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  period          text,
  total_savings   numeric(10,2),
  report_pdf_path text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_savings_user on savings_reports(user_id);

-- ----- ALERTS (alertes meilleures offres) -------------------
create table if not exists alerts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    category not null,
  message     text not null,
  offer_id    uuid references offers(id) on delete set null,
  status      alert_status not null default 'new',
  created_at  timestamptz not null default now()
);
create index if not exists idx_alerts_user on alerts(user_id);

-- ----- SUBSCRIPTIONS (Stripe) -------------------------------
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan_tier              plan_tier not null default 'free',
  status                 text,           -- active / past_due / canceled...
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create unique index if not exists idx_subscriptions_user on subscriptions(user_id);

-- ----- ADVISORS (conseillers — Formule 3) -------------------
create table if not exists advisors (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text,
  phone      text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----- AUDITS (Formule 3) -----------------------------------
create table if not exists audits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  advisor_id   uuid references advisors(id) on delete set null,
  status       audit_status not null default 'requested',
  scheduled_at timestamptz,
  summary      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_audits_user on audits(user_id);

-- ----- AFFILIATE EVENTS (commissions) -----------------------
create table if not exists affiliate_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  provider_id       uuid references providers(id) on delete set null,
  offer_id          uuid references offers(id) on delete set null,
  type              affiliate_type not null,
  commission_amount numeric(10,2),
  status            text not null default 'pending',  -- pending / confirmed / paid
  created_at        timestamptz not null default now()
);
create index if not exists idx_affiliate_user on affiliate_events(user_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
alter table profiles         enable row level security;
alter table households       enable row level security;
alter table contracts        enable row level security;
alter table invoices         enable row level security;
alter table comparisons      enable row level security;
alter table savings_reports  enable row level security;
alter table alerts           enable row level security;
alter table subscriptions    enable row level security;
alter table audits           enable row level security;
alter table affiliate_events enable row level security;
alter table providers        enable row level security;
alter table offers           enable row level security;

-- --- Données publiques : lecture seule pour tous ---
do $$ begin
  create policy "providers public read" on providers for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "offers public read" on offers for select using (true);
exception when duplicate_object then null; end $$;

-- --- profiles : un user gère sa propre ligne ---
do $$ begin
  create policy "profiles self" on profiles
    for all using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- --- Macro : tables scoping par user_id ---
-- (à dupliquer pour chaque table possédant user_id)
do $$
declare t text;
begin
  foreach t in array array[
    'households','contracts','invoices','comparisons',
    'savings_reports','alerts','subscriptions','audits','affiliate_events'
  ]
  loop
    execute format($f$
      do $inner$ begin
        create policy "%1$s owner" on %1$I
          for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
      exception when duplicate_object then null; end $inner$;
    $f$, t);
  end loop;
end $$;

-- =============================================================
-- TRIGGER : créer un profile à l'inscription
-- =============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
