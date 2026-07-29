create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  icon text,
  is_active boolean not null default true
);

alter table public.categories enable row level security;

create policy "categories_select_public"
  on public.categories for select
  using (true);

insert into public.categories (name, slug, icon) values
  ('Mercado', 'mercado', 'shopping-cart'),
  ('Farmácia', 'farmacia', 'medkit'),
  ('Eletrônicos', 'eletronicos', 'tv'),
  ('Casa', 'casa', 'home'),
  ('Outros', 'outros', 'tag');
