/**
 * Contract for support ticket persistence.
 */

import type { AppUserRole, SupportTicketActivityKind, TicketStatus } from "../domain/SupportTicket";

export interface SupportTicketRow {
  id: number;
  user_id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  owner_display_name?: string;
}

export interface SupportTicketReplyRow {
  id: number;
  ticket_id: number;
  author_id: string;
  body: string;
  created_at: string;
}

/** Reply row with author display name (from users join). */
export interface SupportTicketReplyWithAuthor extends SupportTicketReplyRow {
  author_display_name?: string;
  author_email?: string;
  author_role?: AppUserRole;
}

export interface SupportTicketActivityRow {
  id: number;
  ticket_id: number;
  actor_id: string;
  kind: SupportTicketActivityKind;
  from_status?: string | null;
  to_status?: string | null;
  body?: string | null;
  created_at: string;
  actor_display_name?: string;
}

export interface InsertTicketActivityInput {
  ticketId: number;
  actorId: string;
  kind: SupportTicketActivityKind;
  fromStatus?: TicketStatus | null;
  toStatus?: TicketStatus | null;
  body?: string | null;
  sourceReplyId?: number | null;
}

export interface ISupportTicketRepository {
  createTicket(userId: string, subject: string, body: string): Promise<SupportTicketRow>;
  findTicketsByUser(userId: string, status?: TicketStatus | "all"): Promise<SupportTicketRow[]>;
  findAllTickets(status?: TicketStatus | "all"): Promise<SupportTicketRow[]>;
  findTicketById(id: number): Promise<SupportTicketRow | null>;
  updateTicketStatus(id: number, status: TicketStatus): Promise<SupportTicketRow | null>;
  addReply(ticketId: number, authorId: string, body: string): Promise<SupportTicketReplyWithAuthor>;
  getReplies(ticketId: number): Promise<SupportTicketReplyWithAuthor[]>;
  insertTicketActivity(input: InsertTicketActivityInput): Promise<void>;
  listTicketActivities(ticketId: number): Promise<SupportTicketActivityRow[]>;
}
