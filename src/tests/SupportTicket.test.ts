// #1
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { SupportTicketService } from "../service/SupportTicketService";
import { SupportTicketController } from "../controller/SupportTicketController";
import { SupabaseSupportTicketRepository } from "../repository/SupabaseSupportTicketRepository";
import type { IAuthRepository } from "../repository/IAuthRepository";
import {
  SupportTicket,
  SupportTicketReply,
  SupportTicketActivity,
  type TicketStatus,
} from "../domain/SupportTicket";
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

    const updated = await service.updateStatus(created.id, "closed", userId);
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

});

describe("SupportTicketController", () => {
  let serviceMock: Partial<SupportTicketService>;
  let authRepositoryMock: Partial<IAuthRepository>;
  let controller: SupportTicketController;

  function makeTicket(overrides: Partial<SupportTicket> = {}) {
    return new SupportTicket(
      overrides.id ?? 1,
      overrides.userId ?? "user-1",
      overrides.subject ?? "Test subject",
      overrides.body ?? "Test body",
      overrides.status ?? "pending",
      overrides.createdAt ?? new Date("2024-01-01T12:00:00.000Z"),
      overrides.updatedAt ?? new Date("2024-01-01T12:00:00.000Z"),
      overrides.ownerDisplayName,
    );
  }

  function makeActivity(overrides: Partial<SupportTicketActivity> = {}) {
    return new SupportTicketActivity(
      overrides.id ?? 1,
      overrides.ticketId ?? 1,
      overrides.actorId ?? "actor-1",
      overrides.actorDisplayName ?? "Actor Name",
      overrides.kind ?? "ticket_created",
      overrides.createdAt ?? new Date("2024-01-01T12:00:00.000Z"),
      overrides.fromStatus,
      overrides.toStatus,
      overrides.body,
    );
  }

  function makeReply(overrides: Partial<SupportTicketReply> = {}) {
    return new SupportTicketReply(
      overrides.id ?? 10,
      overrides.ticketId ?? 1,
      overrides.authorId ?? "author-1",
      overrides.body ?? "Reply body",
      overrides.createdAt ?? new Date("2024-01-01T13:00:00.000Z"),
      overrides.authorDisplayName,
      overrides.authorEmail,
      overrides.authorRole,
    );
  }

  beforeEach(() => {
    serviceMock = {};
    authRepositoryMock = {};
    controller = new SupportTicketController(serviceMock as SupportTicketService, undefined);
  });

  function adminProfile() {
    return {
      userId: "admin-1",
      email: "admin@example.com",
      role: "Admin" as const,
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
  }

  it("creates a ticket successfully", async () => {
    const ticket = makeTicket({ id: 42, subject: "Help me", body: "The app broke" });
    serviceMock.createTicket = vi.fn().mockResolvedValue(ticket);

    const result = await controller.createTicket("user-1", "Help me", "The app broke");

    expect(result).toEqual({ success: true, ticket: { id: 42 } });
    expect(serviceMock.createTicket).toHaveBeenCalledWith("user-1", "Help me", "The app broke");
  });

  it("returns an error when ticket creation fails", async () => {
    serviceMock.createTicket = vi.fn().mockRejectedValue(new Error("Invalid input"));

    const result = await controller.createTicket("user-1", "", "");

    expect(result).toEqual({ success: false, error: "Invalid input" });
  });

  it("fetches tickets for a user", async () => {
    const ticket = makeTicket({ id: 5, subject: "User issue" });
    serviceMock.getTicketsForUser = vi.fn().mockResolvedValue([ticket]);

    const result = await controller.getTicketsForUser("user-1", "pending");

    expect(result.success).toBe(true);
    expect(result.tickets).toEqual([
      {
        id: 5,
        userId: "user-1",
        subject: "User issue",
        body: "Test body",
        status: "pending",
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        ownerDisplayName: undefined,
      },
    ]);
    expect(serviceMock.getTicketsForUser).toHaveBeenCalledWith("user-1", "pending");
  });

  it("returns an error when fetching user tickets fails", async () => {
    serviceMock.getTicketsForUser = vi.fn().mockRejectedValue(new Error("Database error"));

    const result = await controller.getTicketsForUser("user-1", "all");

    expect(result).toEqual({ success: false, error: "Database error" });
  });

  it("fetches all tickets for an administrator", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue(adminProfile());
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );
    const ticket = makeTicket({ id: 6 });
    serviceMock.getAllTickets = vi.fn().mockResolvedValue([ticket]);

    const result = await controller.getAllTickets("all", "admin-1");

    expect(result.success).toBe(true);
    expect(result.tickets?.[0]).toEqual({
      id: 6,
      userId: "user-1",
      subject: "Test subject",
      body: "Test body",
      status: "pending",
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      ownerDisplayName: undefined,
    });
    expect(serviceMock.getAllTickets).toHaveBeenCalledWith("all");
    expect(authRepositoryMock.getUserProfile).toHaveBeenCalledWith("admin-1");
  });

  it("rejects listing all tickets for non-admin roles", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "staff-1",
      email: "staff@example.com",
      role: "Staff",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );
    serviceMock.getAllTickets = vi.fn();

    const result = await controller.getAllTickets("all", "staff-1");

    expect(result).toEqual({
      success: false,
      error: "Only administrators can access all support tickets",
    });
    expect(serviceMock.getAllTickets).not.toHaveBeenCalled();
  });

  it("returns an error when fetching all tickets fails", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue(adminProfile());
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );
    serviceMock.getAllTickets = vi.fn().mockRejectedValue(new Error("List failure"));

    const result = await controller.getAllTickets("closed", "admin-1");

    expect(result).toEqual({ success: false, error: "List failure" });
  });

  it("fetches a ticket by id", async () => {
    const ticket = makeTicket({ id: 7, subject: "Specific issue" });
    serviceMock.getTicketById = vi.fn().mockResolvedValue(ticket);

    const result = await controller.getTicketById(7);

    expect(result).toEqual({
      success: true,
      ticket: {
        id: 7,
        userId: "user-1",
        subject: "Specific issue",
        body: "Test body",
        status: "pending",
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        ownerDisplayName: undefined,
      },
    });
    expect(serviceMock.getTicketById).toHaveBeenCalledWith(7);
  });

  it("returns not found when ticket by id is missing", async () => {
    serviceMock.getTicketById = vi.fn().mockResolvedValue(null);

    const result = await controller.getTicketById(999);

    expect(result).toEqual({ success: false, error: "Ticket not found" });
  });

  it("returns an error when fetching ticket by id fails", async () => {
    serviceMock.getTicketById = vi.fn().mockRejectedValue(new Error("Fetch failed"));

    const result = await controller.getTicketById(2);

    expect(result).toEqual({ success: false, error: "Fetch failed" });
  });

  it("updates status successfully for an administrator", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue(adminProfile());
    const ticket = makeTicket({ id: 8, status: "processing" });
    serviceMock.updateStatus = vi.fn().mockResolvedValue(ticket);
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.updateStatus(8, "processing", "admin-1");

    expect(result.success).toBe(true);
    expect(result.ticket?.status).toBe("processing");
    expect(authRepositoryMock.getUserProfile).toHaveBeenCalledWith("admin-1");
    expect(serviceMock.updateStatus).toHaveBeenCalledWith(8, "processing", "admin-1");
  });

  it("rejects staff when updating status", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "staff-1",
      email: "staff@example.com",
      role: "Staff",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.updateStatus(8, "closed", "staff-1");

    expect(result).toEqual({
      success: false,
      error: "Only administrators can update ticket status",
    });
  });

  it("rejects unauthorized users when updating status", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "user-2",
      email: "user@example.com",
      role: "User",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.updateStatus(8, "closed", "user-2");

    expect(result).toEqual({
      success: false,
      error: "Only administrators can update ticket status",
    });
  });

  it("returns an error when requesting user profile does not exist", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue(null);
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.updateStatus(8, "closed", "missing-user");

    expect(result).toEqual({ success: false, error: "User not found" });
  });

  it("returns not found when update status targets missing ticket", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      role: "Admin",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    serviceMock.updateStatus = vi.fn().mockResolvedValue(null);
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.updateStatus(999, "closed", "admin-1");

    expect(result).toEqual({ success: false, error: "Ticket not found" });
  });

  it("returns an error when update status fails", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      role: "Admin",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    serviceMock.updateStatus = vi.fn().mockRejectedValue(new Error("Update failed"));
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.updateStatus(8, "closed", "admin-1");

    expect(result).toEqual({ success: false, error: "Update failed" });
  });

  it("adds a reply successfully", async () => {
    const reply = makeReply({ id: 20, body: "New reply", authorDisplayName: "Pat Lee" });
    serviceMock.addReply = vi.fn().mockResolvedValue(reply);

    const result = await controller.addReply(1, "author-1", "New reply");

    expect(result).toEqual({
      success: true,
      reply: {
        id: 20,
        ticketId: 1,
        authorId: "author-1",
        body: "New reply",
        createdAt: reply.createdAt.toISOString(),
        authorDisplayName: "Pat Lee",
        authorEmail: undefined,
        authorRole: undefined,
      },
    });
  });

  it("returns an error when add reply fails", async () => {
    serviceMock.addReply = vi.fn().mockRejectedValue(new Error("Reply failed"));

    const result = await controller.addReply(1, "author-1", "New reply");

    expect(result).toEqual({ success: false, error: "Reply failed" });
  });

  it("fetches replies successfully", async () => {
    const reply = makeReply({ id: 30, authorDisplayName: "Support Agent" });
    serviceMock.getReplies = vi.fn().mockResolvedValue([reply]);

    const result = await controller.getReplies(1, "viewer-1");

    expect(result).toEqual({
      success: true,
      replies: [
        {
          id: 30,
          ticketId: 1,
          authorId: "author-1",
          body: "Reply body",
          createdAt: reply.createdAt.toISOString(),
          authorDisplayName: "Support Agent",
          authorEmail: undefined,
          authorRole: undefined,
        },
      ],
    });
  });

  it("returns an error when fetching replies fails", async () => {
    serviceMock.getReplies = vi.fn().mockRejectedValue(new Error("Reply fetch failed"));

    const result = await controller.getReplies(1, "viewer-1");

    expect(result).toEqual({ success: false, error: "Reply fetch failed" });
  });

  it("denies replies thread access when user is not admin or ticket owner", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "other-1",
      email: "other@example.com",
      role: "User",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    serviceMock.getTicketById = vi.fn().mockResolvedValue(makeTicket({ id: 1, userId: "owner-1" }));
    serviceMock.getReplies = vi.fn();
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.getReplies(1, "other-1");

    expect(result).toEqual({ success: false, error: "Access denied" });
    expect(serviceMock.getReplies).not.toHaveBeenCalled();
  });

  it("fetches ticket activities", async () => {
    const act = makeActivity({
      id: 99,
      kind: "status_changed",
      fromStatus: "pending",
      toStatus: "closed",
    });
    serviceMock.getTicketActivities = vi.fn().mockResolvedValue([act]);

    const result = await controller.getTicketActivities(1, "viewer-1");

    expect(result.success).toBe(true);
    expect(result.activities?.[0]).toMatchObject({
      id: 99,
      ticketId: 1,
      actorId: "actor-1",
      actorDisplayName: "Actor Name",
      kind: "status_changed",
      fromStatus: "pending",
      toStatus: "closed",
    });
    expect(serviceMock.getTicketActivities).toHaveBeenCalledWith(1);
  });

  it("denies activity access when user is not admin or ticket owner", async () => {
    authRepositoryMock.getUserProfile = vi.fn().mockResolvedValue({
      userId: "other-1",
      email: "other@example.com",
      role: "User",
      token: "token",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    serviceMock.getTicketById = vi.fn().mockResolvedValue(makeTicket({ id: 1, userId: "owner-1" }));
    serviceMock.getTicketActivities = vi.fn();
    controller = new SupportTicketController(
      serviceMock as SupportTicketService,
      authRepositoryMock as IAuthRepository,
    );

    const result = await controller.getTicketActivities(1, "other-1");

    expect(result).toEqual({ success: false, error: "Access denied" });
    expect(serviceMock.getTicketActivities).not.toHaveBeenCalled();
  });
});
