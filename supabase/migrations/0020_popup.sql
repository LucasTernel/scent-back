-- Infos du pop-up store, modifiables par l'admin (lieu masqué tant que « annonce » est faux)
insert into reglages (cle, valeur) values ('popup', jsonb_build_object(
  'annonce', false, 'adresse', '23 Rue de Bretagne, 75003 Paris', 'date', '2027-11-13T10:00:00+01:00', 'affiche', null
)) on conflict do nothing;
