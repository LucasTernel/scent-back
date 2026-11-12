-- Collections lancées : tant qu'une licence n'est pas lancée, ses produits sont « Prochainement »
insert into reglages (cle, valeur) values ('licences_lancees', '[]'::jsonb) on conflict do nothing;
