-- Run this once in Supabase → SQL Editor.
-- Lets signed-in users permanently delete their own account
-- (profile, cart, orders, avatar files metadata, and auth user)
-- without needing the Next.js API or the service role key in the app.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  order_ids uuid[];
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(array_agg(id), '{}')
  into order_ids
  from public.orders
  where user_id = uid;

  if array_length(order_ids, 1) is not null then
    delete from public.order_items where order_id = any(order_ids);
    delete from public.orders where user_id = uid;
  end if;

  delete from public.cart_items where user_id = uid;
  delete from public.profiles where id = uid;

  -- Remove auth user (requires security definer)
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
