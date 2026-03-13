/**
 * Contract for support ticket persistence.
 */

import type { TicketStatus } from "../domain/SupportTicket";

export interface SupportTicketRow {
  id: number;
  user_id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
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
}

export interface ISupportTicketRepository {
  createTicket(userId: string, subject: string, body: string): Promise<SupportTicketRow>;
  findTicketsByUser(userId: string, status?: TicketStatus | "all"): Promise<SupportTicketRow[]>;
  findAllTickets(status?: TicketStatus | "all"): Promise<SupportTicketRow[]>;
  findTicketById(id: number): Promise<SupportTicketRow | null>;
  updateTicketStatus(id: number, status: TicketStatus): Promise<SupportTicketRow | null>;
  addReply(ticketId: number, authorId: string, body: string): Promise<SupportTicketReplyRow>;
  getReplies(ticketId: number): Promise<SupportTicketReplyWithAuthor[]>;
}
