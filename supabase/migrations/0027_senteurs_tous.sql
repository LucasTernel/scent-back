-- « Cliquez pour sentir » pour tous les produits (modifiables dans Admin → Boutique → Boutique permanente)
insert into senteurs (id, nom, couleur, tuiles) values
 ('cedre-poivre', 'Cèdre Poivré', '#5E6B4E', '[{"mot":"CÈDRE"},{"mot":"POIVRE"},{"mot":"CUIR"},{"mot":"FUMÉ"},{"mot":"FRAIS"}]'),
 ('bundle-the-division', 'Cèdre Poivré', '#5E6B4E', '[{"mot":"CÈDRE"},{"mot":"POIVRE"},{"mot":"CUIR"},{"mot":"FUMÉ"},{"mot":"FRAIS"}]'),
 ('bundle-prince-of-persia', 'Figue Tabacée', '#B5632E', '[{"mot":"FRUITÉ"},{"mot":"TABAC"},{"mot":"VERT"},{"mot":"BOISÉ"},{"mot":"DOUX"}]'),
 ('savon-assassins-creed', 'Savon Assassin''s Creed', '#E8862E', '[{"mot":"ORANGE"},{"mot":"MARIN"},{"mot":"FRAIS"},{"mot":"AMBRÉ"},{"mot":"DOUX"}]'),
 ('savon-prince-of-persia', 'Savon Prince of Persia', '#B3263A', '[{"mot":"FIGUE"},{"mot":"ROSE"},{"mot":"ÉPICÉ"},{"mot":"MIEL"},{"mot":"DOUX"}]'),
 ('savon-the-division', 'Savon The Division', '#4A4F55', '[{"mot":"CÈDRE"},{"mot":"POIVRE"},{"mot":"MENTHE"},{"mot":"FRAIS"},{"mot":"PROPRE"}]')
on conflict (id) do nothing;
