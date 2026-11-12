-- Boutique permanente gérée en base (avant : liste écrite dans le code)
create table if not exists produits (
  id text primary key,
  nom text not null,
  detail text not null default '',
  prix numeric(8,2) not null check (prix >= 0),
  image text not null default '',
  dispo boolean not null default true,
  ordre int not null default 0
);
alter table produits enable row level security;
create policy "tout le monde lit les produits" on produits for select using (true);
create policy "admin gère les produits" on produits for all using (is_admin()) with check (is_admin());
insert into produits (id, nom, detail, prix, image, dispo, ordre) values
  ('box-ac4', 'Box Assassin''s Creed IV Black Flag', 'Le jeu PS5 + la bougie Rhum Marin 140 g, dans l''écrin en forme de logo.', 59.90, '/site/box.webp', true, 1),
  ('rhum-marin', 'Bougie Rhum Marin', '140 g · cire 100 % végétale · coulée en France. Brûle le temps du jeu.', 24.90, '/site/bougie.webp', true, 2),
  ('figue-tabacee', 'Bougie Figue Tabacée', '70 g · cire 100 % végétale. La prochaine licence de la collection All Stars.', 16.90, '/site/etiquette-pop.webp', false, 3)
on conflict do nothing;
