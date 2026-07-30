insert into storage.buckets (id, name, public)
values ('promotion-images', 'promotion-images', true)
on conflict (id) do nothing;

-- Leitura pública das fotos de promoção.
create policy "promotion_images_select_public"
  on storage.objects for select
  using (bucket_id = 'promotion-images');

-- Upload restrito à própria pasta ({user_id}/...), só para usuários autenticados.
create policy "promotion_images_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'promotion-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "promotion_images_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'promotion-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
