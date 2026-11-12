-- 5 raretés : commune, rare, super rare, épique, légendaire
alter table statues drop constraint statues_rarity_check;
alter table statues add constraint statues_rarity_check check (rarity in ('commune','rare','superrare','epique','legendaire'));

-- Reclassement + points par rareté + un modèle 3D unique par statuette
-- (le Révolutionnaire et l'Ultimate gardent leur modèle)
update statues s set rarity = v.r, points = v.p, model_url = coalesce(v.m, s.model_url)
from (values
  ('MARAIS-9TB', 'commune',    30,  '/models/lapin-marais.glb'),
  ('CANAL-5MZ',  'commune',    30,  '/models/lapin-canal.glb'),
  ('PNEUF-6HC',  'commune',    30,  '/models/lapin-pneuf.glb'),
  ('BASTI-4GN',  'commune',    30,  null),
  ('DEMO-1',     'commune',    30,  '/models/lapin-demo-1.glb'),
  ('NDAME-K8P',  'rare',       60,  '/models/lapin-ndame.glb'),
  ('LUXEM-1SJ',  'rare',       60,  '/models/lapin-luxem.glb'),
  ('DEMO-2',     'rare',       60,  '/models/lapin-demo-2.glb'),
  ('MONTM-3XR',  'superrare',  100, '/models/lapin-montm.glb'),
  ('OPERA-8LV',  'superrare',  100, '/models/lapin-opera.glb'),
  ('PANTH-7EF',  'epique',     150, '/models/lapin-panth.glb'),
  ('LOUVRE-7Q2', 'epique',     150, '/models/lapin-louvre.glb'),
  ('EIFFEL-2WD', 'legendaire', 200, '/models/lapin-eiffel.glb'),
  ('ARC-5YK',    'legendaire', 200, '/models/lapin-arc.glb'),
  ('DEMO-3',     'legendaire', 200, '/models/lapin-demo-3.glb'),
  ('ULTIME-AC',  'legendaire', 250, null)
) as v(code, r, p, m)
where s.code = v.code;
