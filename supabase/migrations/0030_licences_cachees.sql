-- Collections masquées : leurs produits n'apparaissent plus du tout dans la boutique
insert into reglages (cle, valeur) values ('licences_cachees', '[]'::jsonb) on conflict do nothing;
