
-- pin search_path & lock down helpers
create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- restrict avatar listing to owner; objects are still publicly fetchable by URL via bucket=public
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars owner list" on storage.objects for select
  using (bucket_id='avatars' and auth.uid()::text = (storage.foldername(name))[1]);
