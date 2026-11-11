-- Collections + médias (image / modèle 3D) + espace admin
create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);
alter table statues add column collection_id uuid references collections on delete set null;
alter table statues add column model_url text;

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

alter table collections enable row level security;
create policy "collections lisibles" on collections for select using (true);
create policy "admin gère collections" on collections for all using (is_admin()) with check (is_admin());
create policy "admin gère statues" on statues for all using (is_admin()) with check (is_admin());

drop view public_statues;
create view public_statues as
select id, name, description, hint, district, rarity, points, image_url, model_url, collection_id, is_demo,
  round(lat::numeric, 3)::float as zone_lat, round(lng::numeric, 3)::float as zone_lng
from statues where active;
grant select on public_statues to anon, authenticated;

-- Médias publics (images, .glb), upload réservé aux admins
insert into storage.buckets (id, name, public) values ('medias', 'medias', true);
create policy "admin upload medias" on storage.objects for insert with check (bucket_id = 'medias' and is_admin());
create policy "admin modifie medias" on storage.objects for update using (bucket_id = 'medias' and is_admin());

-- Pour te passer admin (remplace le pseudo) :
-- update profiles set role = 'admin' where username = 'ton_pseudo';
