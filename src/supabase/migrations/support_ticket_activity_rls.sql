-- Optional: use only if `support_ticket_activity` has Row Level Security ON and reads/writes return empty / fail.
-- Requires: logged-in Supabase users (JWT) and `public.users.id` = `auth.uid()` (same as this app).
-- If you do not use RLS on these tables, skip this file.

ALTER TABLE support_ticket_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sta_select_own_or_admin" ON support_ticket_activity;
CREATE POLICY "sta_select_own_or_admin"
  ON support_ticket_activity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_ticket_activity.ticket_id
        AND (
          t.user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
        )
    )
  );

DROP POLICY IF EXISTS "sta_insert_actor" ON support_ticket_activity;
CREATE POLICY "sta_insert_actor"
  ON support_ticket_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id
        AND (
          t.user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
        )
    )
  );
