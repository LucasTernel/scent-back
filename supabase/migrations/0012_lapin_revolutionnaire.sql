-- Le Lapin Révolutionnaire (Bastille) reçoit son modèle : cagoule, cocarde, torche, pancarte « On va prendre la Bastille ! »
update statues set model_url = '/models/lapin-revolutionnaire.glb',
  description = 'Cagoule sur la tête, torche à la main et pancarte en carton : le 14 juillet, c''est lui qui menait la foule. Personne ne lui a dit que la Bastille n''existait plus.'
where code = 'BASTI-4GN';
