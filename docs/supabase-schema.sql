create table if not exists public.orders (
  id text primary key,
  access_token text not null,
  email text not null,
  client_request_id text,
  customer_name text,
  story_prompt text not null,
  source_images jsonb not null default '[]'::jsonb,
  cloudinary_folder text,
  status text not null,
  unlocked boolean not null default false,
  payment_reference text,
  payment_provider text,
  preview_asset jsonb,
  final_asset jsonb,
  delivery jsonb,
  cloudinary_cloud_name text,
  last_error text,
  metadata jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists orders_email_idx on public.orders (email);
create unique index if not exists orders_email_client_request_id_uidx
  on public.orders (email, client_request_id)
  where client_request_id is not null;
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_updated_at_idx on public.orders (updated_at desc);

create table if not exists public.generation_jobs (
  order_id text primary key references public.orders (id) on delete cascade,
  status text not null,
  provider text not null,
  payment_reference text,
  last_error text,
  queued_at timestamptz,
  processing_at timestamptz,
  preview_ready_at timestamptz,
  completed_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists generation_jobs_status_idx on public.generation_jobs (status);

create table if not exists public.generated_assets (
  order_id text not null references public.orders (id) on delete cascade,
  kind text not null,
  provider text not null,
  url text not null,
  public_id text,
  format text,
  width integer,
  height integer,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (order_id, kind)
);

create table if not exists public.event_log (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders (id) on delete cascade,
  event_type text not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists event_log_order_created_idx on public.event_log (order_id, created_at desc);
