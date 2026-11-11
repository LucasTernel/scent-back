-- Collection n°1 : toutes les statuettes actuelles y sont rangées
with c as (
  insert into collections (name, description)
  values ('Assassin''s Creed — 20 ans dans l''ombre',
          'Vingt ans de Credo, quinze lapins encapuchonnés cachés dans Paris. Rien n''est vrai, tout est permis… sauf rater un lapin.')
  returning id
)
update statues set collection_id = (select id from c) where collection_id is null;
