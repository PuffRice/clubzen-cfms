/**
 * Supabase implementation for support tickets, replies, and activity log.
 */

import { supabase } from "@core/supabase/client";
import type {
  ISupportTicketRepository,
  SupportTicketRow,
  SupportTicketReplyRow,
  SupportTicketReplyWithAuthor,
  SupportTicketActivityRow,
  InsertTicketActivityInput,
} from "./ISupportTicketRepository";
import type { TicketStatus } from "../domain/SupportTicket";

const TICKET_USER_SELECT = "*, users(full_name, email)";

function ownerNameFromUsers(users: { full_name?: string; email?: string } | null | undefined): string | undefined {
  if (!users) return undefined;
  const n = (users.full_name && users.full_name.trim()) || users.email;
  return n || undefined;
}

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
      .select(TICKET_USER_SELECT)
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
      .select(TICKET_USER_SELECT)
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
      .select(TICKET_USER_SELECT)
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
      .select(TICKET_USER_SELECT)
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
      .select(TICKET_USER_SELECT)
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
  ): Promise<SupportTicketReplyWithAuthor> {
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .insert({
        ticket_id: ticketId,
        author_id: authorId,
        body: body.trim(),
      })
      .select("*, users(full_name, email, role)")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Insert reply returned no data");

    return this.mapReplyRowWithAuthor(data);
  }

  async getReplies(ticketId: number): Promise<SupportTicketReplyWithAuthor[]> {
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .select("*, users(full_name, email, role)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => this.mapReplyRowWithAuthor(r));
  }

  async insertTicketActivity(input: InsertTicketActivityInput): Promise<void> {
    const row: Record<string, unknown> = {
      ticket_id: input.ticketId,
      actor_id: input.actorId,
      kind: input.kind,
      from_status: input.fromStatus ?? null,
      to_status: input.toStatus ?? null,
      body: input.body ?? null,
      source_reply_id: input.sourceReplyId ?? null,
    };
    const { error } = await supabase.from("support_ticket_activity").insert(row);
    if (error) throw error;
  }

  async listTicketActivities(ticketId: number): Promise<SupportTicketActivityRow[]> {
    const { data, error } = await supabase
      .from("support_ticket_activity")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    const raw = (data ?? []) as Record<string, unknown>[];
    const actorIds = [...new Set(raw.map((r) => String(r.actor_id)).filter(Boolean))];
    const nameById = new Map<string, string>();
    if (actorIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", actorIds);
      if (!usersError && usersData) {
        for (const u of usersData as {
          id: string;
          full_name?: string | null;
          email?: string | null;
        }[]) {
          const n = (u.full_name && u.full_name.trim()) || u.email || "Unknown";
          nameById.set(u.id, n);
        }
      }
    }
    return raw.map((r) => this.mapActivityRow(r, nameById.get(String(r.actor_id))));
  }

  private mapTicketRow(r: Record<string, unknown>): SupportTicketRow {
    const users = r.users as { full_name?: string; email?: string } | null | undefined;
    return {
      id: Number(r.id),
      user_id: String(r.user_id),
      subject: String(r.subject),
      body: String(r.body),
      status: r.status as TicketStatus,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
      owner_display_name: ownerNameFromUsers(users),
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
    const users = r.users as { full_name?: string; email?: string; role?: string } | null | undefined;
    const name =
      (users?.full_name && users.full_name.trim()) ||
      users?.email ||
      "Unknown";
    const roleRaw = users?.role;
    const author_role =
      roleRaw === "Admin" || roleRaw === "Staff" || roleRaw === "User" ? roleRaw : undefined;
    return {
      ...this.mapReplyRow(r),
      author_display_name: name,
      author_email: users?.email?.trim() || undefined,
      author_role,
    };
  }

  private mapActivityRow(
    r: Record<string, unknown>,
    actorDisplayNameOverride?: string
  ): SupportTicketActivityRow {
    const users = r.users as { full_name?: string; email?: string } | null | undefined;
    const fromJoin =
      (users?.full_name && users.full_name.trim()) || users?.email || undefined;
    const name = fromJoin || actorDisplayNameOverride || "Unknown";
    return {
      id: Number(r.id),
      ticket_id: Number(r.ticket_id),
      actor_id: String(r.actor_id),
      kind: r.kind as SupportTicketActivityRow["kind"],
      from_status: r.from_status != null ? String(r.from_status) : null,
      to_status: r.to_status != null ? String(r.to_status) : null,
      body: r.body != null ? String(r.body) : null,
      created_at: String(r.created_at),
      actor_display_name: name,
    };
  }
}
