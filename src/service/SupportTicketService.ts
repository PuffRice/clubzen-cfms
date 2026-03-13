/**
 * Support ticket application logic: create tickets, list by status, add replies, update status.
 */

import { SupportTicket, SupportTicketReply, type TicketStatus } from "../domain/SupportTicket";
import type {
  ISupportTicketRepository,
  SupportTicketRow,
  SupportTicketReplyRow,
  SupportTicketReplyWithAuthor,
} from "../repository/ISupportTicketRepository";

export class SupportTicketService {
  constructor(private readonly repo: ISupportTicketRepository) {}

  async createTicket(
    userId: string,
    subject: string,
    body: string
  ): Promise<SupportTicket> {
    if (!subject?.trim()) throw new Error("Subject is required.");
    if (!body?.trim()) throw new Error("Body is required.");
    const row = await this.repo.createTicket(userId, subject.trim(), body.trim());
    return this.toDomainTicket(row);
  }

  async getTicketsForUser(
    userId: string,
    status?: TicketStatus | "all"
  ): Promise<SupportTicket[]> {
    const rows = await this.repo.findTicketsByUser(userId, status ?? "all");
    return rows.map((r) => this.toDomainTicket(r));
  }

  async getAllTickets(status?: TicketStatus | "all"): Promise<SupportTicket[]> {
    const rows = await this.repo.findAllTickets(status ?? "all");
    return rows.map((r) => this.toDomainTicket(r));
  }

  async getTicketById(id: number): Promise<SupportTicket | null> {
    const row = await this.repo.findTicketById(id);
    return row ? this.toDomainTicket(row) : null;
  }

  async updateStatus(id: number, status: TicketStatus): Promise<SupportTicket | null> {
    const row = await this.repo.updateTicketStatus(id, status);
    return row ? this.toDomainTicket(row) : null;
  }

  async addReply(
    ticketId: number,
    authorId: string,
    body: string
  ): Promise<SupportTicketReply> {
    if (!body?.trim()) throw new Error("Reply body is required.");
    const row = await this.repo.addReply(ticketId, authorId, body.trim());
    return this.toDomainReply(row);
  }

  async getReplies(ticketId: number): Promise<SupportTicketReply[]> {
    const rows = await this.repo.getReplies(ticketId);
    return rows.map((r) => this.toDomainReplyWithAuthor(r));
  }

  private toDomainTicket(r: SupportTicketRow): SupportTicket {
    return new SupportTicket(
      r.id,
      r.user_id,
      r.subject,
      r.body,
      r.status,
      new Date(r.created_at),
      new Date(r.updated_at)
    );
  }

  private toDomainReply(r: SupportTicketReplyRow): SupportTicketReply {
    return new SupportTicketReply(
      r.id,
      r.ticket_id,
      r.author_id,
      r.body,
      new Date(r.created_at)
    );
  }

  private toDomainReplyWithAuthor(r: SupportTicketReplyWithAuthor): SupportTicketReply {
    return new SupportTicketReply(
      r.id,
      r.ticket_id,
      r.author_id,
      r.body,
      new Date(r.created_at),
      r.author_display_name
    );
  }
}
