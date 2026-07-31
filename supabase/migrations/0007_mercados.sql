create table public.mercados (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  is_active boolean not null default true
);

alter table public.mercados enable row level security;

create policy "mercados_select_public"
  on public.mercados for select
  using (true);

insert into public.mercados (name, slug) values
  ('Carrefour', 'carrefour'),
  ('Extra', 'extra'),
  ('Assaí', 'assai'),
  ('Pão de Açúcar', 'pao-de-acucar'),
  ('Dia', 'dia');
