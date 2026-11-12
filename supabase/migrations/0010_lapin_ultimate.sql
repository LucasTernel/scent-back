-- Le légendaire ultime, avec son modèle 3D (servi par le site : /models/lapin-ultimate.glb)
insert into statues (code, name, description, hint, district, rarity, points, lat, lng, model_url, collection_id)
values (
  'ULTIME-AC', 'Lapin Ultimate',
  'Le maître de la Confrérie. Capuche bleu nuit, épée au poing et sourire de dément : vingt ans de Credo résumés en un seul lapin. On dit qu''il a appris le Saut de la Foi… en tombant.',
  'Là où Paris garde ses archives, un maître veille sur les registres…',
  'Hôtel de Ville', 'legendaire', 250, 48.8566, 2.3522,
  '/models/lapin-ultimate.glb',
  (select id from collections order by created_at limit 1)
);
