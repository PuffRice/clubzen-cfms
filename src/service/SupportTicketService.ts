/**
 * Support ticket application logic: create tickets, list by status, add replies, update status, activity log.
 */

import {
  SupportTicket,
  SupportTicketReply,
  SupportTicketActivity,
  type TicketStatus,
} from "../domain/SupportTicket";
import type {
  ISupportTicketRepository,
  SupportTicketRow,
  SupportTicketReplyWithAuthor,
  SupportTicketActivityRow,
  InsertTicketActivityInput,
} from "../repository/ISupportTicketRepository";

export class SupportTicketService {
  constructor(private readonly repo: ISupportTicketRepository) {}

  /** Activity rows are optional until `support_ticket_activity` migration is applied. */
  private async safeInsertActivity(input: InsertTicketActivityInput): Promise<void> {
    try {
      await this.repo.insertTicketActivity(input);
    } catch {
      /* Table missing, RLS, or network — ticket/reply/status already saved */
    }
  }

  async createTicket(
    userId: string,
    subject: string,
    body: string
  ): Promise<SupportTicket> {
    if (!subject?.trim()) throw new Error("Subject is required.");
    if (!body?.trim()) throw new Error("Body is required.");
    const row = await this.repo.createTicket(userId, subject.trim(), body.trim());
    await this.safeInsertActivity({
      ticketId: row.id,
      actorId: userId,
      kind: "ticket_created",
    });
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

  async updateStatus(
    id: number,
    status: TicketStatus,
    actorId: string
  ): Promise<SupportTicket | null> {
    const existing = await this.repo.findTicketById(id);
    if (!existing) return null;
    const row = await this.repo.updateTicketStatus(id, status);
    if (!row) return null;
    if (actorId && existing.status !== status) {
      await this.safeInsertActivity({
        ticketId: id,
        actorId,
        kind: "status_changed",
        fromStatus: existing.status,
        toStatus: status,
      });
    }
    return this.toDomainTicket(row);
  }

  async addReply(
    ticketId: number,
    authorId: string,
    body: string
  ): Promise<SupportTicketReply> {
    if (!body?.trim()) throw new Error("Reply body is required.");
    const row = await this.repo.addReply(ticketId, authorId, body.trim());
    await this.safeInsertActivity({
      ticketId,
      actorId: authorId,
      kind: "reply_added",
      body: row.body,
      sourceReplyId: row.id,
    });
    return this.toDomainReplyWithAuthor(row);
  }

  async getReplies(ticketId: number): Promise<SupportTicketReply[]> {
    const rows = await this.repo.getReplies(ticketId);
    return rows.map((r) => this.toDomainReplyWithAuthor(r));
  }

  async getTicketActivities(ticketId: number): Promise<SupportTicketActivity[]> {
    let rows: SupportTicketActivityRow[] = [];
    try {
      rows = await this.repo.listTicketActivities(ticketId);
    } catch {
      rows = [];
    }

    const ticket = await this.repo.findTicketById(ticketId);
    if (!ticket) return [];

    const hasCreated = rows.some((r) => r.kind === "ticket_created");
    if (!hasCreated) {
      rows = [
        {
          id: -ticketId,
          ticket_id: ticketId,
          actor_id: ticket.user_id,
          kind: "ticket_created",
          from_status: null,
          to_status: null,
          body: null,
          created_at: ticket.created_at,
          actor_display_name: ticket.owner_display_name,
        },
        ...rows,
      ];
    }

    rows.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return rows.map((r) => this.toDomainActivity(r));
  }

  private toDomainTicket(r: SupportTicketRow): SupportTicket {
    return new SupportTicket(
      r.id,
      r.user_id,
      r.subject,
      r.body,
      r.status,
      new Date(r.created_at),
      new Date(r.updated_at),
      r.owner_display_name
    );
  }

  private toDomainReply(r: SupportTicketReplyWithAuthor): SupportTicketReply {
    return new SupportTicketReply(
      r.id,
      r.ticket_id,
      r.author_id,
      r.body,
      new Date(r.created_at),
      r.author_display_name,
      r.author_email,
      r.author_role
    );
  }

  private toDomainReplyWithAuthor(r: SupportTicketReplyWithAuthor): SupportTicketReply {
    return this.toDomainReply(r);
  }

  private toDomainActivity(r: SupportTicketActivityRow): SupportTicketActivity {
    const from = r.from_status as TicketStatus | undefined;
    const to = r.to_status as TicketStatus | undefined;
    return new SupportTicketActivity(
      r.id,
      r.ticket_id,
      r.actor_id,
      r.actor_display_name ?? "Unknown",
      r.kind,
      new Date(r.created_at),
      from && ["pending", "processing", "closed"].includes(from) ? from : undefined,
      to && ["pending", "processing", "closed"].includes(to) ? to : undefined,
      r.body ?? undefined
    );
  }
}
