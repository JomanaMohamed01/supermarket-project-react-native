-- Run this once in Supabase → SQL Editor.
-- Lets a signed-in user permanently delete their own account,
-- whether it was created on the website or in the app.
-- Removes profile, cart, orders, avatar files, and the auth user.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  extra record;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Storage ownership blocks deleting auth.users.
  begin
    delete from storage.objects
    where owner::text = uid::text
       or name like uid::text || '/%';
  exception
    when undefined_table or insufficient_privilege then
      null;
  end;

  if to_regclass('public.orders') is not null
     and to_regclass('public.order_items') is not null then
    delete from public.order_items
    where order_id in (
      select id from public.orders where user_id::text = uid::text
    );
  end if;

  -- Website tables that store this user, before parent rows are removed.
  for extra in
    select table_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'user_id'
      and table_name not in ('orders', 'cart_items')
  loop
    begin
      execute format(
        'delete from public.%I where user_id::text = $1',
        extra.table_name
      )
      using uid::text;
    exception
      when foreign_key_violation then
        null;
    end;
  end loop;

  if to_regclass('public.orders') is not null then
    delete from public.orders where user_id::text = uid::text;
  end if;

  if to_regclass('public.cart_items') is not null then
    delete from public.cart_items where user_id::text = uid::text;
  end if;

  if to_regclass('public.profiles') is not null then
    delete from public.profiles where id::text = uid::text;
  end if;

  delete from auth.sessions where user_id = uid;
  -- refresh_tokens.user_id is text, not uuid.
  delete from auth.refresh_tokens where user_id = uid::text;
  delete from auth.identities where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
