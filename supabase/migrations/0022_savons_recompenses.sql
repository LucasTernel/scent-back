-- Boutique permanente : savons Lapin Crétin, un par jeu
insert into produits (id, nom, detail, prix, image, dispo, ordre) values
  ('savon-assassins-creed', 'Savon Bwaaah · Assassin''s Creed', 'Savon en forme de Lapin Crétin, rouge Assassin''s Creed.', 7.90, '/site/savons/assassins-creed.webp', true, 10),
  ('savon-far-cry', 'Savon Bwaaah · Far Cry', 'Savon en forme de Lapin Crétin, orange Far Cry.', 7.90, '/site/savons/far-cry.webp', true, 11),
  ('savon-rayman', 'Savon Bwaaah · Rayman', 'Savon en forme de Lapin Crétin, violet Rayman.', 7.90, '/site/savons/rayman.webp', true, 12),
  ('savon-watch-dogs', 'Savon Bwaaah · Watch Dogs', 'Savon en forme de Lapin Crétin, vert Watch Dogs.', 7.90, '/site/savons/watch-dogs.webp', true, 13),
  ('savon-prince-of-persia', 'Savon Bwaaah · Prince of Persia', 'Savon en forme de Lapin Crétin, or Prince of Persia.', 7.90, '/site/savons/prince-of-persia.webp', true, 14),
  ('savon-just-dance', 'Savon Bwaaah · Just Dance', 'Savon en forme de Lapin Crétin, rose Just Dance.', 7.90, '/site/savons/just-dance.webp', true, 15),
  ('savon-rainbow-six', 'Savon Bwaaah · Rainbow Six', 'Savon en forme de Lapin Crétin, bleu Rainbow Six.', 7.90, '/site/savons/rainbow-six.webp', true, 16)
on conflict (id) do nothing;

-- Récompenses : on retire les anciens lots (ceux déjà échangés passent en rupture pour garder les bons des joueurs)
delete from rewards r where not exists (select 1 from commandes b where b.reward_id = r.id);
update rewards set stock = 0;
-- Barème : les 13 lapins de Paris rapportent 1 390 pts au total (+50 par parrainage)
insert into rewards (name, cost, stock, image_url) values
  ('Lot goodies Scent Back (tote bag, mug, carnet, badge…)', 300, 150, '/site/goodies.webp'),
  ('Une bougie de ton choix', 600, 80, '/site/bougie.webp'),
  ('Figurine spéciale Lapin Crétin', 900, 40, '/avatars/lapin-ultimate.png'),
  ('Un bundle au choix, hors All Stars (ex. Box Assassin''s Creed IV)', 1300, 15, '/site/box.webp');
