-- GovCon Proposal Studio — initial schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.capability_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null default 'Default capability profile',
  narrative text not null default '',
  differentiators text[] not null default '{}',
  past_performance_summary text not null default '',
  key_personnel_summary text not null default '',
  certifications text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfp_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);

create index if not exists rfp_documents_opportunity_id_idx on public.rfp_documents (opportunity_id);

create table if not exists public.extracted_document_chunks (
  id uuid primary key default gen_random_uuid(),
  rfp_document_id uuid not null references public.rfp_documents (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  chunk_index integer not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists chunks_opportunity_id_idx on public.extracted_document_chunks (opportunity_id);

create table if not exists public.compatibility_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  opportunity_id uuid not null unique references public.opportunities (id) on delete cascade,
  compatibility_score integer not null,
  bid_recommendation text not null,
  recommendation_rationale text not null,
  key_risks text[] not null default '{}',
  fit_summary text not null,
  opportunity_summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  category text not null,
  requirement text not null,
  source_hint text,
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists compliance_opportunity_id_idx on public.compliance_requirements (opportunity_id);

create table if not exists public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  section_key text not null,
  title text not null,
  content text not null default '',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, section_key)
);

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  job_type text not null,
  status text not null,
  phase_index integer not null default 0,
  public_message text,
  error_message text,
  result_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Storage: create a private bucket "rfp-documents" in the Supabase dashboard, then:
-- (Policies can be locked down; service role bypasses RLS for server routes.)

alter table public.companies enable row level security;
alter table public.capability_profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.rfp_documents enable row level security;
alter table public.extracted_document_chunks enable row level security;
alter table public.compatibility_reports enable row level security;
alter table public.compliance_requirements enable row level security;
alter table public.proposal_sections enable row level security;
alter table public.agent_jobs enable row level security;

-- Replace with your auth strategy; placeholder allows service role (bypass) only for now.
-- For production, add policies for authenticated users scoped to company_id.

create policy "service_role_bypass_companies" on public.companies for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_cap" on public.capability_profiles for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_opp" on public.opportunities for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_rfp" on public.rfp_documents for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_chunk" on public.extracted_document_chunks for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_cr" on public.compatibility_reports for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_comp" on public.compliance_requirements for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_sec" on public.proposal_sections for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_bypass_job" on public.agent_jobs for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
