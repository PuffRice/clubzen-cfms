import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SupportTicketService } from "../service/SupportTicketService";

describe("SupportTicketService", () => {
  let service: SupportTicketService;
  let mockedRepo: any;

  beforeEach(() => {
    mockedRepo = {
      createTicket: vi.fn(),
      findTicketsByUser: vi.fn(),
      findAllTickets: vi.fn(),
      findTicketById: vi.fn(),
      updateTicketStatus: vi.fn(),
      addReply: vi.fn(),
      getReplies: vi.fn(),
    };

    service = new SupportTicketService(mockedRepo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a ticket", async () => {
    const mockRow = {
      id: 1,
      user_id: "user123",
      subject: "Problem",
      body: "Oops",
      status: "open" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    vi.mocked(mockedRepo.createTicket).mockResolvedValue(mockRow);

    const created = await service.createTicket("user123", "Problem", "Oops");

    expect(mockedRepo.createTicket).toHaveBeenCalledWith("user123", "Problem", "Oops");
    expect(created).toEqual(expect.objectContaining({ id: 1, subject: "Problem" }));
  });

  it("gets tickets for user", async () => {
    const mockRows = [
      {
        id: 1,
        user_id: "user123",
        subject: "Issue 1",
        body: "Body 1",
        status: "pending" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    (mockedRepo.findTicketsByUser as any).mockResolvedValue(mockRows);

    const tickets = await service.getTicketsForUser("user123", "pending");

    expect(mockedRepo.findTicketsByUser).toHaveBeenCalledWith("user123", "pending");
    expect(tickets).toHaveLength(1);
    expect(tickets[0]).toEqual(expect.objectContaining({ subject: "Issue 1" }));
  });

  it("gets all tickets", async () => {
    const mockRows = [
      {
        id: 1,
        user_id: "user123",
        subject: "Issue 1",
        body: "Body 1",
        status: "open" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: "user456",
        subject: "Issue 2",
        body: "Body 2",
        status: "closed" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    vi.mocked(mockedRepo.findAllTickets).mockResolvedValue(mockRows);

    const tickets = await service.getAllTickets("all");

    expect(mockedRepo.findAllTickets).toHaveBeenCalledWith("all");
    expect(tickets).toHaveLength(2);
  });

  it("gets ticket by id", async () => {
    const mockRow = {
      id: 11,
      user_id: "user123",
      subject: "Specific Issue",
      body: "Details",
      status: "open" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    vi.mocked(mockedRepo.findTicketById).mockResolvedValue(mockRow);

    const ticket = await service.getTicketById(11);

    expect(mockedRepo.findTicketById).toHaveBeenCalledWith(11);
    expect(ticket).toEqual(expect.objectContaining({ id: 11, subject: "Specific Issue" }));
  });

  it("updates ticket status", async () => {
    const mockRow = {
      id: 20,
      user_id: "user123",
      subject: "Issue",
      body: "Body",
      status: "resolved" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    vi.mocked(mockedRepo.updateTicketStatus).mockResolvedValue(mockRow);

    const updated = await service.updateStatus(20, "closed");

    expect(mockedRepo.updateTicketStatus).toHaveBeenCalledWith(20, "closed");
    expect(updated?.status).toBe("closed");
  });

  it("adds a reply to ticket", async () => {
    const mockReplyRow = {
      id: 5,
      ticket_id: 1,
      author_id: "user456",
      body: "Reply text",
      created_at: new Date().toISOString(),
    };
    vi.mocked(mockedRepo.addReply).mockResolvedValue(mockReplyRow);

    const reply = await service.addReply(1, "user456", "Reply text");

    expect(mockedRepo.addReply).toHaveBeenCalledWith(1, "user456", "Reply text");
    expect(reply).toEqual(expect.objectContaining({ id: 5, body: "Reply text" }));
  });

  it("gets replies for ticket", async () => {
    const mockReplyRows = [
      {
        id: 5,
        ticket_id: 1,
        author_id: "user456",
        body: "Reply 1",
        created_at: new Date().toISOString(),
        author_display_name: "John Doe",
      },
      {
        id: 6,
        ticket_id: 1,
        author_id: "user789",
        body: "Reply 2",
        created_at: new Date().toISOString(),
        author_display_name: "Jane Smith",
      },
    ];
    vi.mocked(mockedRepo.getReplies).mockResolvedValue(mockReplyRows);

    const replies = await service.getReplies(1);

    expect(mockedRepo.getReplies).toHaveBeenCalledWith(1);
    expect(replies).toHaveLength(2);
    expect(replies[0]).toEqual(expect.objectContaining({ body: "Reply 1" }));
  });
});