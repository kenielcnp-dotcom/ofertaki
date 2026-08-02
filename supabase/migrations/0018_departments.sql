-- Departamentos (seção do supermercado): eixo diferente de `categories`
-- (tipo de estabelecimento, sempre "Mercado" no MVP, nunca exposto em UI).
-- department_id fica nullable — promoções antigas não têm valor correto pra
-- backfill; obrigatório só no formulário de publicação (validação zod).

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  icon text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

alter table public.departments enable row level security;

create policy "departments_select_public" on public.departments for select using (true);

insert into public.departments (name, slug, icon, sort_order) values
  ('Alimentos', 'alimentos', 'basket-outline', 1),
  ('Bebidas', 'bebidas', 'wine-outline', 2),
  ('Higiene', 'higiene', 'water-outline', 3),
  ('Limpeza', 'limpeza', 'sparkles-outline', 4),
  ('Açougue', 'acougue', 'restaurant-outline', 5),
  ('Hortifruti', 'hortifruti', 'leaf-outline', 6);

alter table public.promotions
  add column department_id uuid references public.departments (id);

create index promotions_department_id_idx on public.promotions (department_id);
