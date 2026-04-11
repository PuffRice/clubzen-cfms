/**
 * Support ticket domain entities and value types.
 */

export type TicketStatus = "pending" | "processing" | "closed";

/** Matches `users.role` in the database. */
export type AppUserRole = "Admin" | "Staff" | "User";

export type SupportTicketActivityKind = "ticket_created" | "status_changed" | "reply_added";

export class SupportTicket {
  constructor(
    readonly id: number,
    readonly userId: string,
    readonly subject: string,
    readonly body: string,
    readonly status: TicketStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly ownerDisplayName?: string
  ) {}
}

export class SupportTicketReply {
  constructor(
    readonly id: number,
    readonly ticketId: number,
    readonly authorId: string,
    readonly body: string,
    readonly createdAt: Date,
    readonly authorDisplayName?: string,
    readonly authorEmail?: string,
    readonly authorRole?: AppUserRole
  ) {}
}

export class SupportTicketActivity {
  constructor(
    readonly id: number,
    readonly ticketId: number,
    readonly actorId: string,
    readonly actorDisplayName: string,
    readonly kind: SupportTicketActivityKind,
    readonly createdAt: Date,
    readonly fromStatus?: TicketStatus,
    readonly toStatus?: TicketStatus,
    readonly body?: string
  ) {}
}
