import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MessageCircle, Plus, Send, ChevronRight, X } from "lucide-react";
import { supportTicketController } from "../services";
import type { TicketStatus } from "@core/domain/SupportTicket";

type Tab = "all" | TicketStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "closed", label: "Closed" },
];

interface TicketItem {
  id: number;
  userId: string;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReplyItem {
  id: number;
  ticketId: number;
  authorId: string;
  body: string;
  createdAt: string;
  authorDisplayName?: string;
}

export function Support() {
  const userId = sessionStorage.getItem("userId") ?? "";
  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const isStaff = userRole === "Admin" || userRole === "Staff";

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const statusFilter = activeTab === "all" ? "all" : activeTab;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isStaff) {
        const res = await supportTicketController.getAllTickets(statusFilter);
        if (res.success && res.tickets) setTickets(res.tickets as TicketItem[]);
        else setTickets([]);
        if (res.error) setError(res.error);
      } else {
        const res = await supportTicketController.getTicketsForUser(userId, statusFilter);
        if (res.success && res.tickets) setTickets(res.tickets as TicketItem[]);
        else setTickets([]);
        if (res.error) setError(res.error);
      }
    } catch {
      setError("Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [userId, isStaff, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchReplies = useCallback(
    async (ticketId: number) => {
      const res = await supportTicketController.getReplies(ticketId);
      if (res.success && res.replies) setReplies(res.replies as ReplyItem[]);
      else setReplies([]);
    },
    []
  );

  async function handleOpenTicket() {
    if (!newSubject.trim() || !newBody.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await supportTicketController.createTicket(userId, newSubject.trim(), newBody.trim());
    setSubmitting(false);
    if (res.success) {
      setOpenDialog(false);
      setNewSubject("");
      setNewBody("");
      fetchTickets();
    } else {
      setError(res.error ?? "Failed to create ticket");
    }
  }

  function openDetail(t: TicketItem) {
    setSelectedTicket(t);
    setReplyBody("");
    fetchReplies(t.id);
  }

  async function handleAddReply() {
    if (!selectedTicket || !replyBody.trim()) return;
    setReplySubmitting(true);
    const res = await supportTicketController.addReply(
      selectedTicket.id,
      userId,
      replyBody.trim()
    );
    setReplySubmitting(false);
    if (res.success) {
      setReplyBody("");
      fetchReplies(selectedTicket.id);
    }
  }

  async function handleUpdateStatus(status: TicketStatus) {
    if (!selectedTicket) return;
    setStatusUpdating(true);
    const res = await supportTicketController.updateStatus(
        selectedTicket.id,
        status,
        userId
      );
    setStatusUpdating(false);
    if (res.success && res.ticket) {
      setSelectedTicket(res.ticket as TicketItem);
      fetchTickets();
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support</h1>
          <p className="text-muted-foreground mt-1">Open and manage support tickets</p>
        </div>
        <Button
          onClick={() => setOpenDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Open ticket
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === key
                ? "bg-primary text-primary-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <p className="text-muted-foreground">No tickets in this tab.</p>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(t)}
                    className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 text-left transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{t.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">{t.body}</p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                        t.status === "closed"
                          ? "bg-muted text-muted-foreground"
                          : t.status === "processing"
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {t.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Open ticket dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Open a ticket</h2>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                onClick={() => setOpenDialog(false)}
                title="Cancel"
                aria-label="Cancel and close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief subject"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe your issue…"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleOpenTicket}
                  disabled={submitting || !newSubject.trim() || !newBody.trim()}
                >
                  {submitting ? "Sending…" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket detail (replies) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedTicket.body}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedTicket.status === "closed"
                      ? "bg-muted text-muted-foreground"
                      : selectedTicket.status === "processing"
                      ? "bg-blue-500/20 text-blue-600"
                      : "bg-amber-500/20 text-amber-600"
                  }`}
                >
                  {selectedTicket.status}
                </span>
              </div>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                onClick={() => setSelectedTicket(null)}
                title="Close"
                aria-label="Close ticket detail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {isStaff && selectedTicket.status !== "closed" && (
              <div className="px-6 py-2 border-b border-border flex gap-2 flex-wrap">
                {(["pending", "processing", "closed"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={selectedTicket.status === s ? "default" : "outline"}
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(s)}
                  >
                    Set {s}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {replies.length === 0 ? (
                <p className="text-muted-foreground text-sm">No replies yet.</p>
              ) : (
                replies.map((r) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-lg border ${
                      r.authorId === userId
                        ? "bg-primary/5 border-primary/20 ml-4"
                        : "bg-muted/30 border-border mr-4"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {r.authorId === userId
                        ? r.authorDisplayName
                          ? `You (${r.authorDisplayName})`
                          : "You"
                        : r.authorDisplayName ?? "Support"}{" "}
                      · {new Date(r.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{r.body}</p>
                  </div>
                ))
              )}
            </div>
            {selectedTicket.status !== "closed" && (
              <div className="p-4 border-t border-border flex gap-2">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type a reply…"
                  rows={2}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background resize-none text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleAddReply}
                  disabled={replySubmitting || !replyBody.trim()}
                  title="Send reply"
                  aria-label="Send reply"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
