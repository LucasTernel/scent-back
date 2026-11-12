-- All Stars en tête (édition limitée) + « victime de son succès » activable par produit
alter table produits add column if not exists epuise boolean not null default false;
update produits set ordre = 0, detail = 'Les trois jeux PS5 et les trois bougies (Rhum Marin, Cèdre Poivré, Figue Tabacée) dans un coffret collector. Dans la limite des 1 000 premières commandes.' where id = 'bundle-all-stars';
