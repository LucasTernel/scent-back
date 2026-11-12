-- Réglages du site modifiables par l'admin (ex. boutique en ligne ouverte ou non)
create table if not exists reglages (cle text primary key, valeur jsonb not null);
alter table reglages enable row level security;
create policy "tout le monde lit les réglages" on reglages for select using (true);
create policy "admin gère les réglages" on reglages for all using (is_admin()) with check (is_admin());
insert into reglages (cle, valeur) values ('boutique_ouverte', 'false') on conflict do nothing;
