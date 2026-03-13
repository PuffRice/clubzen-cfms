/**
 * Supabase implementation for support tickets and replies.
 */

import { supabase } from "@core/supabase/client";
import type {
  ISupportTicketRepository,
  SupportTicketRow,
  SupportTicketReplyRow,
  SupportTicketReplyWithAuthor,
} from "./ISupportTicketRepository";
import type { TicketStatus } from "../domain/SupportTicket";

export class SupabaseSupportTicketRepository implements ISupportTicketRepository {
  async createTicket(
    userId: string,
    subject: string,
    body: string
  ): Promise<SupportTicketRow> {
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject: subject.trim(),
        body: body.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Insert returned no data");

    return this.mapTicketRow(data);
  }

  async findTicketsByUser(
    userId: string,
    status?: TicketStatus | "all"
  ): Promise<SupportTicketRow[]> {
    let query = supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => this.mapTicketRow(r));
  }

  async findAllTickets(status?: TicketStatus | "all"): Promise<SupportTicketRow[]> {
    let query = supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => this.mapTicketRow(r));
  }

  async findTicketById(id: number): Promise<SupportTicketRow | null> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapTicketRow(data) : null;
  }

  async updateTicketStatus(
    id: number,
    status: TicketStatus
  ): Promise<SupportTicketRow | null> {
    const { data, error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? this.mapTicketRow(data) : null;
  }

  async addReply(
    ticketId: number,
    authorId: string,
    body: string
  ): Promise<SupportTicketReplyRow> {
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .insert({
        ticket_id: ticketId,
        author_id: authorId,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Insert reply returned no data");

    return this.mapReplyRow(data);
  }

  async getReplies(ticketId: number): Promise<SupportTicketReplyWithAuthor[]> {
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .select("*, users(full_name, email)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => this.mapReplyRowWithAuthor(r));
  }

  private mapTicketRow(r: Record<string, unknown>): SupportTicketRow {
    return {
      id: Number(r.id),
      user_id: String(r.user_id),
      subject: String(r.subject),
      body: String(r.body),
      status: r.status as TicketStatus,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
    };
  }

  private mapReplyRow(r: Record<string, unknown>): SupportTicketReplyRow {
    return {
      id: Number(r.id),
      ticket_id: Number(r.ticket_id),
      author_id: String(r.author_id),
      body: String(r.body),
      created_at: String(r.created_at),
    };
  }

  private mapReplyRowWithAuthor(r: Record<string, unknown>): SupportTicketReplyWithAuthor {
    const users = r.users as { full_name?: string; email?: string } | null | undefined;
    const name =
      (users?.full_name && users.full_name.trim()) ||
      users?.email ||
      "Unknown";
    return {
      ...this.mapReplyRow(r),
      author_display_name: name,
    };
  }
}
