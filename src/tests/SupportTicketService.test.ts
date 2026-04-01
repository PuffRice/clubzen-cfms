import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { SupportTicketService } from "../service/SupportTicketService";
import { SupabaseSupportTicketRepository } from "../repository/SupabaseSupportTicketRepository";
import { clearSupabaseTables, resolveIntegrationTestUserId } from "./SupabaseTestHelper";

describe("SupportTicketService (Supabase)", () => {
  let service: SupportTicketService;
  let userId: string;

  beforeEach(async () => {
    await clearSupabaseTables();
    userId = await resolveIntegrationTestUserId();
    service = new SupportTicketService(new SupabaseSupportTicketRepository());
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  it("creates a ticket", async () => {
    const created = await service.createTicket(userId, "Problem", "Oops body");

    expect(created.subject).toBe("Problem");
    expect(created.body).toBe("Oops body");
    expect(created.status).toBe("pending");
    expect(created.userId).toBe(userId);
  });

  it("gets tickets for user filtered by status", async () => {
    await service.createTicket(userId, "Issue 1", "Body 1");

    const tickets = await service.getTicketsForUser(userId, "pending");
    expect(tickets.length).toBeGreaterThanOrEqual(1);
    expect(tickets.some((t) => t.subject === "Issue 1")).toBe(true);
  });

  it("gets all tickets", async () => {
    await service.createTicket(userId, "A", "b1");
    await service.createTicket(userId, "B", "b2");

    const tickets = await service.getAllTickets("all");
    expect(tickets.length).toBeGreaterThanOrEqual(2);
  });

  it("gets ticket by id", async () => {
    const created = await service.createTicket(userId, "Specific Issue", "Details");

    const ticket = await service.getTicketById(created.id);
    expect(ticket).not.toBeNull();
    expect(ticket!.subject).toBe("Specific Issue");
  });

  it("updates ticket status", async () => {
    const created = await service.createTicket(userId, "Issue", "Body");

    const updated = await service.updateStatus(created.id, "closed");
    expect(updated?.status).toBe("closed");
  });

  it("adds a reply to ticket", async () => {
    const created = await service.createTicket(userId, "With reply", "Body");

    const reply = await service.addReply(created.id, userId, "Reply text");
    expect(reply.body).toBe("Reply text");
    expect(reply.ticketId).toBe(created.id);
  });

  it("gets replies for ticket", async () => {
    const created = await service.createTicket(userId, "Thread", "Body");
    await service.addReply(created.id, userId, "Reply 1");
    await service.addReply(created.id, userId, "Reply 2");

    const replies = await service.getReplies(created.id);
    expect(replies).toHaveLength(2);
    expect(replies.map((r) => r.body).sort()).toEqual(["Reply 1", "Reply 2"]);
  });

  it("throws if subject is empty", async () => {
    await expect(service.createTicket(userId, "", "body")).rejects.toThrow("Subject is required.");
  });

  it("throws if body is empty", async () => {
    await expect(service.createTicket(userId, "subject", "")).rejects.toThrow("Body is required.");
  });

  it("throws if reply body is empty", async () => {
    const created = await service.createTicket(userId, "x", "y");
    await expect(service.addReply(created.id, userId, "")).rejects.toThrow("Reply body is required.");
  });

  it("returns null if ticket not found", async () => {
    const ticket = await service.getTicketById(999999);
    expect(ticket).toBeNull();
  });

  it("returns null if update targets missing ticket", async () => {
    const updated = await service.updateStatus(999999, "closed");
    expect(updated).toBeNull();
  });
});
