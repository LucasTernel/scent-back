-- Admin : vue des liens d'amitié et du parrainage
create or replace function admin_amis() returns table (joueur text, avatar_url text, amis text[], parrain text, filleuls int)
language sql security definer set search_path = public stable as $$
  select p.username, p.avatar_url,
    coalesce(array(select q.username from friendships f join profiles q on q.id = f.friend_id where f.user_id = p.id order by q.username), '{}'),
    (select q.username from profiles q where q.id = p.parrain_id),
    (select count(*) from profiles q where q.parrain_id = p.id)::int
  from profiles p
  where is_admin() and p.role = 'player'
  order by 3 desc nulls last, p.username
$$;
grant execute on function admin_amis() to authenticated;
