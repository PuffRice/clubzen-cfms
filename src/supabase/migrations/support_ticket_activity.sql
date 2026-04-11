-- Activity log for support tickets (who did what and when).
-- Run on existing Supabase projects after base schema.

CREATE TABLE IF NOT EXISTS support_ticket_activity (
  id BIGSERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(30) NOT NULL CHECK (kind IN ('ticket_created', 'status_changed', 'reply_added')),
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  body TEXT,
  source_reply_id INT REFERENCES support_ticket_replies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT support_ticket_activity_source_reply_unique UNIQUE (source_reply_id)
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_activity_ticket_id
  ON support_ticket_activity(ticket_id, created_at);

-- Backfill: ticket opened (at most one created row per ticket)
INSERT INTO support_ticket_activity (ticket_id, actor_id, kind, created_at)
SELECT t.id, t.user_id, 'ticket_created', t.created_at
FROM support_tickets t
WHERE NOT EXISTS (
  SELECT 1 FROM support_ticket_activity a
  WHERE a.ticket_id = t.id AND a.kind = 'ticket_created'
);

-- Backfill: existing replies (idempotent via source_reply_id)
INSERT INTO support_ticket_activity (ticket_id, actor_id, kind, body, created_at, source_reply_id)
SELECT r.ticket_id, r.author_id, 'reply_added', r.body, r.created_at, r.id
FROM support_ticket_replies r
ON CONFLICT (source_reply_id) DO NOTHING;
