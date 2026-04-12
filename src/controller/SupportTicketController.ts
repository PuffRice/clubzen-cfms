/**
 * Support ticket controller — delegates to SupportTicketService.
 * Only Admin may list all tickets or update status. Replies: ticket owner or Admin.
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
          ownerDisplayName: t.ownerDisplayName,
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch tickets";
      return { success: false, error: message };
    }
  }

  async getAllTickets(
    status: TicketStatus | "all" | undefined,
    requestingUserId: string
  ): Promise<{ success: boolean; tickets?: Array<Record<string, unknown>>; error?: string }> {
    try {
      if (this.authRepository) {
        if (!requestingUserId) {
          return { success: false, error: "Authentication required" };
        }
        const profile = await this.authRepository.getUserProfile(requestingUserId);
        if (!profile) return { success: false, error: "User not found" };
        if (profile.role !== "Admin") {
          return { success: false, error: "Only administrators can access all support tickets" };
        }
      }
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
          ownerDisplayName: t.ownerDisplayName,
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch tickets";
      return { success: false, error: message };
    }
  }

  async getTicketById(
    id: number,
    requestingUserId?: string
  ): Promise<{ success: boolean; ticket?: Record<string, unknown>; error?: string }> {
    try {
      const ticket = await this.supportTicketService.getTicketById(id);
      if (!ticket) return { success: false, error: "Ticket not found" };
      if (this.authRepository) {
        if (!requestingUserId) {
          return { success: false, error: "Authentication required" };
        }
        const profile = await this.authRepository.getUserProfile(requestingUserId);
        if (!profile) return { success: false, error: "User not found" };
        if (profile.role !== "Admin" && ticket.userId !== requestingUserId) {
          return { success: false, error: "Access denied" };
        }
      }
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
          ownerDisplayName: ticket.ownerDisplayName,
        },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch ticket";
      return { success: false, error: message };
    }
  }

  /**
   * Only Admin may update ticket status. Pass requestingUserId to enforce.
   */
  async updateStatus(
    id: number,
    status: TicketStatus,
    requestingUserId?: string
  ): Promise<{ success: boolean; ticket?: Record<string, unknown>; error?: string }> {
    try {
      if (this.authRepository) {
        if (!requestingUserId) {
          return { success: false, error: "Authentication required" };
        }
        const profile = await this.authRepository.getUserProfile(requestingUserId);
        if (!profile) return { success: false, error: "User not found" };
        if (profile.role !== "Admin") {
          return { success: false, error: "Only administrators can update ticket status" };
        }
      }
      const ticket = await this.supportTicketService.updateStatus(
        id,
        status,
        requestingUserId ?? ""
      );
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
          ownerDisplayName: ticket.ownerDisplayName,
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
      if (this.authRepository) {
        if (!authorId) {
          return { success: false, error: "Authentication required" };
        }
        const ticket = await this.supportTicketService.getTicketById(ticketId);
        if (!ticket) return { success: false, error: "Ticket not found" };
        if (ticket.status === "closed") {
          return { success: false, error: "This ticket is closed" };
        }
        const profile = await this.authRepository.getUserProfile(authorId);
        if (!profile) return { success: false, error: "User not found" };
        const isAdmin = profile.role === "Admin";
        const isOwner = ticket.userId === authorId;
        if (!isAdmin && !isOwner) {
          return { success: false, error: "You can only reply on your own tickets" };
        }
      }
      const reply = await this.supportTicketService.addReply(ticketId, authorId, body);
      return {
        success: true,
        reply: {
          id: reply.id,
          ticketId: reply.ticketId,
          authorId: reply.authorId,
          body: reply.body,
          createdAt: reply.createdAt.toISOString(),
          authorDisplayName: reply.authorDisplayName,
          authorEmail: reply.authorEmail,
          authorRole: reply.authorRole,
        },
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to add reply";
      return { success: false, error: message };
    }
  }

  async getReplies(
    ticketId: number,
    requestingUserId: string
  ): Promise<{ success: boolean; replies?: Array<Record<string, unknown>>; error?: string }> {
    try {
      if (this.authRepository) {
        if (!requestingUserId) {
          return { success: false, error: "Authentication required" };
        }
        const ticket = await this.supportTicketService.getTicketById(ticketId);
        if (!ticket) return { success: false, error: "Ticket not found" };
        const profile = await this.authRepository.getUserProfile(requestingUserId);
        if (!profile) return { success: false, error: "User not found" };
        if (profile.role !== "Admin" && ticket.userId !== requestingUserId) {
          return { success: false, error: "Access denied" };
        }
      }
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
          authorEmail: r.authorEmail,
          authorRole: r.authorRole,
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch replies";
      return { success: false, error: message };
    }
  }

  /**
   * Chronological activity (created, status changes, replies) with actor names. Same access rules as getReplies.
   */
  async getTicketActivities(
    ticketId: number,
    requestingUserId: string
  ): Promise<{ success: boolean; activities?: Array<Record<string, unknown>>; error?: string }> {
    try {
      if (this.authRepository) {
        if (!requestingUserId) {
          return { success: false, error: "Authentication required" };
        }
        const ticket = await this.supportTicketService.getTicketById(ticketId);
        if (!ticket) return { success: false, error: "Ticket not found" };
        const profile = await this.authRepository.getUserProfile(requestingUserId);
        if (!profile) return { success: false, error: "User not found" };
        if (profile.role !== "Admin" && ticket.userId !== requestingUserId) {
          return { success: false, error: "Access denied" };
        }
      }
      const activities = await this.supportTicketService.getTicketActivities(ticketId);
      return {
        success: true,
        activities: activities.map((a) => ({
          id: a.id,
          ticketId: a.ticketId,
          actorId: a.actorId,
          actorDisplayName: a.actorDisplayName,
          kind: a.kind,
          createdAt: a.createdAt.toISOString(),
          fromStatus: a.fromStatus,
          toStatus: a.toStatus,
          body: a.body,
        })),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch activity";
      return { success: false, error: message };
    }
  }
}
