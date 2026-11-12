-- Prix revus : bundle = prix du jeu PS5 (~59,99 €) + bougie (~20 €) + petite marge
update produits set prix = 84.90 where id = 'box-ac4';
update produits set prix = 21.90 where id = 'rhum-marin';
update produits set prix = 14.90 where id = 'figue-tabacee';
update produits set prix = 8.90 where categorie = 'savon';
