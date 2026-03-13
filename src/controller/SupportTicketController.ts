/**
 * Support ticket controller — delegates to SupportTicketService.
 * Only Admin and Staff may update ticket status.
 */

import { SupportTicketService } from "../service/SupportTicketService";
import type { TicketStatus } from "../domain/SupportTicket";
import type { IAuthRepository } from "../repository/IAuthRepository";

export class SupportTicketController {
  constructor(
    private readonly supportTicketService: SupportTicketService,
    private readonly authRepository?: IAuthRepository
  ) {}

  async createTicket(
    userId: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; ticket?: { id: number }; error?: string }> {
    try {
      const ticket = await this.supportTicketService.createTicket(userId, subject, body);
      return { success: true, ticket: { id: ticket.id } };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create ticket";
      return { success: false, error: message };
    }
  }

  async getTicketsForUser(
    userId: string,
    status?: TicketStatus | "all"
  ): Promise<{ success: boolean; tickets?: Array<Record<string, unknown>>; error?: string }> {
    try {
      const tickets = await this.supportTicketService.getTicketsForUser(userId, status);
      return {
        success: true,
        tickets: tickets.map((t) => ({
          id: t.id,
          userId: t.userId,
          subject: t.subject,
          body: t.body,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch tickets";
      return { success: false, error: message };
    }
  }

  async getAllTickets(
    status?: TicketStatus | "all"
  ): Promise<{ success: boolean; tickets?: Array<Record<string, unknown>>; error?: string }> {
    try {
      const tickets = await this.supportTicketService.getAllTickets(status);
      return {
        success: true,
        tickets: tickets.map((t) => ({
          id: t.id,
          userId: t.userId,
          subject: t.subject,
          body: t.body,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch tickets";
      return { success: false, error: message };
    }
  }

  async getTicketById(
    id: number
  ): Promise<{ success: boolean; ticket?: Record<string, unknown>; error?: string }> {
    try {
      const ticket = await this.supportTicketService.getTicketById(id);
      if (!ticket) return { success: false, error: "Ticket not found" };
      return {
        success: true,
        ticket: {
          id: ticket.id,
          userId: ticket.userId,
          subject: ticket.subject,
          body: ticket.body,
          status: ticket.status,
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch ticket";
      return { success: false, error: message };
    }
  }

  /**
   * Only Admin and Staff may update ticket status. Pass requestingUserId to enforce.
   */
  async updateStatus(
    id: number,
    status: TicketStatus,
    requestingUserId?: string
  ): Promise<{ success: boolean; ticket?: Record<string, unknown>; error?: string }> {
    try {
      if (requestingUserId && this.authRepository) {
        const profile = await this.authRepository.getUserProfile(requestingUserId);
        if (!profile) return { success: false, error: "User not found" };
        if (profile.role !== "Admin" && profile.role !== "Staff") {
          return { success: false, error: "Only staff can update ticket status" };
        }
      }
      const ticket = await this.supportTicketService.updateStatus(id, status);
      if (!ticket) return { success: false, error: "Ticket not found" };
      return {
        success: true,
        ticket: {
          id: ticket.id,
          userId: ticket.userId,
          subject: ticket.subject,
          body: ticket.body,
          status: ticket.status,
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update status";
      return { success: false, error: message };
    }
  }

  async addReply(
    ticketId: number,
    authorId: string,
    body: string
  ): Promise<{ success: boolean; reply?: Record<string, unknown>; error?: string }> {
    try {
      const reply = await this.supportTicketService.addReply(ticketId, authorId, body);
      return {
        success: true,
        reply: {
          id: reply.id,
          ticketId: reply.ticketId,
          authorId: reply.authorId,
          body: reply.body,
          createdAt: reply.createdAt.toISOString(),
        },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add reply";
      return { success: false, error: message };
    }
  }

  async getReplies(
    ticketId: number
  ): Promise<{ success: boolean; replies?: Array<Record<string, unknown>>; error?: string }> {
    try {
      const replies = await this.supportTicketService.getReplies(ticketId);
      return {
        success: true,
        replies: replies.map((r) => ({
          id: r.id,
          ticketId: r.ticketId,
          authorId: r.authorId,
          body: r.body,
          createdAt: r.createdAt.toISOString(),
          authorDisplayName: r.authorDisplayName,
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch replies";
      return { success: false, error: message };
    }
  }
}
