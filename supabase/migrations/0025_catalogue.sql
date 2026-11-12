-- Catalogue complet : bundles par licence, bougies seules (pas encore en vente), savons par collection
alter table produits add column if not exists licence text;
delete from produits where id like 'savon-%' or id in ('figue-tabacee');
-- Prix : jeu PS5 + bougie (~20 €) + petite marge
insert into produits (id, nom, detail, prix, image, dispo, ordre, categorie, licence) values
  ('box-ac4', 'Bundle Assassin''s Creed IV Black Flag', 'Le jeu PS5 et la bougie Rhum Marin 140 g, dans l''écrin en forme de logo Assassin''s Creed.', 84.90, '/site/produits/bundle-black-flag.webp', true, 1, 'bundle', 'Assassin''s Creed'),
  ('bundle-prince-of-persia', 'Bundle Prince of Persia : The Lost Crown', 'Le jeu PS5 et la bougie Figue Tabacée, dans un coffre au trésor.', 64.90, '/site/produits/bundle-prince-of-persia.webp', true, 2, 'bundle', 'Prince of Persia'),
  ('bundle-the-division', 'Bundle Tom Clancy''s The Division', 'Le jeu PS5 et la bougie Cèdre Poivré, dans une mallette d''agent SHD.', 54.90, '/site/produits/bundle-the-division.webp', true, 3, 'bundle', 'The Division'),
  ('bundle-all-stars', 'All Stars Bundle', 'Les trois jeux PS5 et les trois bougies (Rhum Marin, Cèdre Poivré, Figue Tabacée) dans un coffret collector.', 169.90, '/site/produits/bundle-all-stars.webp', true, 4, 'bundle', 'All Stars'),
  ('rhum-marin', 'Bougie Rhum Marin', '140 g · cire 100 % végétale. L''odeur d''Assassin''s Creed IV Black Flag.', 21.90, '/site/produits/bougie-rhum-marin.webp', false, 10, 'bougie', 'Assassin''s Creed'),
  ('cedre-poivre', 'Bougie Cèdre Poivré', '140 g · cire 100 % végétale. L''odeur de The Division.', 21.90, '/site/produits/bougie-cedre-poivre.webp', false, 11, 'bougie', 'The Division'),
  ('figue-tabacee', 'Bougie Figue Tabacée', '140 g · cire 100 % végétale. L''odeur de Prince of Persia.', 21.90, '/site/produits/bougie-figue-tabacee.webp', false, 12, 'bougie', 'Prince of Persia'),
  ('savon-assassins-creed', 'Savon Bwaaah · Assassin''s Creed', 'Savon en forme de Lapin Crétin, orange Assassin''s Creed.', 8.90, '/site/savons/assassins-creed.webp', true, 20, 'savon', 'Assassin''s Creed'),
  ('savon-prince-of-persia', 'Savon Bwaaah · Prince of Persia', 'Savon en forme de Lapin Crétin, rouge Prince of Persia.', 8.90, '/site/savons/prince-of-persia.webp', true, 21, 'savon', 'Prince of Persia'),
  ('savon-the-division', 'Savon Bwaaah · The Division', 'Savon en forme de Lapin Crétin, anthracite The Division.', 8.90, '/site/savons/the-division.webp', true, 22, 'savon', 'The Division')
on conflict (id) do update set nom = excluded.nom, detail = excluded.detail, prix = excluded.prix, image = excluded.image,
  dispo = excluded.dispo, ordre = excluded.ordre, categorie = excluded.categorie, licence = excluded.licence;
-- récompense « bundle au choix » : nouvelle image
update rewards set image_url = '/site/produits/bundle-black-flag.webp' where name like 'Un bundle au choix%';
