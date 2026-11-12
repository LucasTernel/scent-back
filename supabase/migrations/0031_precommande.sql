-- Précommande : commandable avant le lancement, avec une date de livraison prévue
alter table produits add column if not exists precommande date;
update produits set precommande = '2027-11-13' where id = 'bundle-all-stars';
