-- Catégories de la boutique permanente
alter table produits add column if not exists categorie text not null default 'bougie' check (categorie in ('bundle','bougie','savon'));
update produits set categorie = 'bundle' where id = 'box-ac4';
update produits set categorie = 'savon' where id like 'savon-%';
