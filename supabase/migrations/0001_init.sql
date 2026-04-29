-- Proposal generation platform — initial schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).

-- ── proposals ────────────────────────────────────────────────────────────
create table if not exists public.proposals (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users(id) on delete cascade,
  public_slug         text unique not null,
  status              text not null default 'draft'
                      check (status in ('draft','sent','viewed','signed','paid','cancelled')),
  client_company      text not null,
  client_name         text not null,
  client_email        text,
  title               text not null,
  data                jsonb not null default '{}'::jsonb,
  total_cents         integer not null default 0 check (total_cents >= 0),
  currency            text not null default 'usd',
  stripe_session_id   text,
  paid_at             timestamptz,
  signed_at           timestamptz,
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists proposals_owner_id_idx on public.proposals (owner_id);
create index if not exists proposals_public_slug_idx on public.proposals (public_slug);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

-- ── proposal_events (append-only audit log) ──────────────────────────────
create table if not exists public.proposal_events (
  id            bigserial primary key,
  proposal_id   uuid not null references public.proposals(id) on delete cascade,
  type          text not null
                check (type in ('created','sent','viewed','signed','paid','cancelled')),
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists proposal_events_proposal_idx
  on public.proposal_events (proposal_id, created_at desc);

-- ── signatures (one per proposal in v1) ──────────────────────────────────
create table if not exists public.signatures (
  id              uuid primary key default gen_random_uuid(),
  proposal_id     uuid not null unique references public.proposals(id) on delete cascade,
  signer_name     text not null,
  signer_title    text,
  signature_url   text not null,
  signed_at       timestamptz not null default now(),
  ip              inet,
  user_agent      text
);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.proposals       enable row level security;
alter table public.proposal_events enable row level security;
alter table public.signatures      enable row level security;

-- Owner: full CRUD on their own proposals.
drop policy if exists "owner reads"   on public.proposals;
drop policy if exists "owner writes"  on public.proposals;
drop policy if exists "owner updates" on public.proposals;
drop policy if exists "owner deletes" on public.proposals;
drop policy if exists "public read by slug" on public.proposals;

create policy "owner reads"   on public.proposals
  for select using (auth.uid() = owner_id);
create policy "owner writes"  on public.proposals
  for insert with check (auth.uid() = owner_id);
create policy "owner updates" on public.proposals
  for update using (auth.uid() = owner_id);
create policy "owner deletes" on public.proposals
  for delete using (auth.uid() = owner_id);

-- Anon: SELECT proposals where slug exists. Slug IS the secret.
-- Drafts are filtered at the application layer (server-rendered page returns 404).
create policy "public read by slug" on public.proposals
  for select to anon
  using (public_slug is not null);

-- Owner reads their proposal events.
drop policy if exists "owner reads events" on public.proposal_events;
create policy "owner reads events" on public.proposal_events
  for select using (
    exists (select 1 from public.proposals p
            where p.id = proposal_id and p.owner_id = auth.uid())
  );

-- Owner reads signatures for their proposals.
drop policy if exists "owner reads sigs" on public.signatures;
create policy "owner reads sigs" on public.signatures
  for select using (
    exists (select 1 from public.proposals p
            where p.id = proposal_id and p.owner_id = auth.uid())
  );

-- All public-page writes (events insert, signature insert, status flips on
-- view/sign/pay) go through server routes using the SERVICE ROLE key, which
-- bypasses RLS. We deliberately do NOT grant insert/update to anon.

-- ── Storage bucket for signature PNGs ────────────────────────────────────
-- Create via SQL so the migration is self-contained.
insert into storage.buckets (id, name, public)
  values ('signatures', 'signatures', false)
  on conflict (id) do nothing;
