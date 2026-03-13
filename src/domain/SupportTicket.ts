/**
 * Support ticket domain entities and value types.
 */

export type TicketStatus = "pending" | "processing" | "closed";

export class SupportTicket {
  constructor(
    readonly id: number,
    readonly userId: string,
    readonly subject: string,
    readonly body: string,
    readonly status: TicketStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export class SupportTicketReply {
  constructor(
    readonly id: number,
    readonly ticketId: number,
    readonly authorId: string,
    readonly body: string,
    readonly createdAt: Date,
    readonly authorDisplayName?: string
  ) {}
}
