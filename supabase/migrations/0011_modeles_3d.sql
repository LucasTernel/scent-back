-- Un modèle 3D pour chaque statuette, selon sa rareté (variantes du Lapin, dans /public/models)
-- communes : Novice / Éclaireur · rares : Templier / Ombre · légendaires : Maître (l'Ultimate garde le sien)
with ordre as (
  select id, rarity, row_number() over (partition by rarity order by name) as n
  from statues where model_url is null
)
update statues s set model_url = case
  when o.rarity = 'commune'    then case when o.n % 2 = 1 then '/models/lapin-novice.glb' else '/models/lapin-eclaireur.glb' end
  when o.rarity = 'rare'       then case when o.n % 2 = 1 then '/models/lapin-templier.glb' else '/models/lapin-ombre.glb' end
  else '/models/lapin-maitre.glb'
end
from ordre o where o.id = s.id;
