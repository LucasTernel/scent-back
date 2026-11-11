-- Statistiques admin (refusées si l'appelant n'est pas admin)
create function admin_stats() returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'réservé aux admins'; end if;
  return json_build_object(
    'joueurs', (select count(*) from profiles where role = 'player'),
    'actifs_7j', (select count(distinct user_id) from captures where created_at > now() - interval '7 days'),
    'captures', (select count(*) from captures),
    'captures_7j', (select count(*) from captures where created_at > now() - interval '7 days'));
end $$;

-- Par collection : nb de statuettes et nb de joueurs ayant scanné au moins `mini` statuettes de la collection
create function admin_collections_stats(mini int) returns table (id uuid, name text, statuettes int, joueurs int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'réservé aux admins'; end if;
  return query
    select c.id, c.name,
      (select count(*)::int from statues s where s.collection_id = c.id),
      (select count(*)::int from (select cp.user_id from captures cp join statues s on s.id = cp.statue_id
        where s.collection_id = c.id group by cp.user_id having count(*) >= mini) t)
    from collections c order by c.created_at;
end $$;

-- Par statuette : obtentions
create function admin_statues_stats() returns table (statue_id uuid, captures int, derniere timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'réservé aux admins'; end if;
  return query select cp.statue_id, count(*)::int, max(cp.created_at) from captures cp group by cp.statue_id;
end $$;

grant execute on function admin_stats(), admin_collections_stats(int), admin_statues_stats() to authenticated;
