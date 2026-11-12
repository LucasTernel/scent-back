-- Bundles ≈ 100 € (jeu ~80 € + bougie ~20 €) ; All Stars = 3 bundles avec remise
update produits set prix = 99.90 where id in ('box-ac4', 'bundle-prince-of-persia', 'bundle-the-division');
update produits set prix = 279.90 where id = 'bundle-all-stars';
update produits set prix = 19.90 where categorie = 'bougie';
