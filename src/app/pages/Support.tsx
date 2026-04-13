import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ArrowDown10, ArrowUp10, ChevronDown, Plus, Send, ChevronRight, X } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { supportTicketController } from "../services";
import type { TicketStatus } from "@core/domain/SupportTicket";
import { formatExactTimestamp } from "../../utils/formatExactTimestamp";
import { formatReplyAuthorForViewer } from "../../utils/formatReplyAuthorForViewer";
import {
  sortTicketsByOpenedAt,
  TICKET_OPENED_SORT_LABELS,
  type TicketOpenedSort,
} from "../../utils/sortTicketsByOpenedAt";

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
  ownerDisplayName?: string;
}

interface ReplyItem {
  id: number;
  body: string;
  createdAt: string;
  authorDisplayName?: string;
  authorEmail?: string;
  authorRole?: string;
}

const SEEN_KEY = "support_ticket_seen";

function getSeenMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch { return {}; }
}

function markSeen(ticketId: number, updatedAt: string) {
  const map = getSeenMap();
  map[String(ticketId)] = updatedAt;
  localStorage.setItem(SEEN_KEY, JSON.stringify(map));
}

function hasNewActivity(ticketId: number, updatedAt: string): boolean {
  const last = getSeenMap()[String(ticketId)];
  return !last || new Date(updatedAt) > new Date(last);
}

export function Support() {
  const userId = sessionStorage.getItem("userId") ?? "";
  const userRole = (sessionStorage.getItem("userRole") ?? "Staff").trim();
  const isAdmin = userRole === "Admin";

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newTicketError, setNewTicketError] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [ticketSort, setTicketSort] = useState<TicketOpenedSort>("date-desc");

  const statusFilter = activeTab === "all" ? "all" : activeTab;

  const sortedTickets = useMemo(
    () => sortTicketsByOpenedAt(tickets, ticketSort),
    [tickets, ticketSort]
  );

  const ticketSortIcon: Record<TicketOpenedSort, ReactNode> = {
    "date-desc": <ArrowDown10 className="h-3.5 w-3.5 shrink-0" />,
    "date-asc": <ArrowUp10 className="h-3.5 w-3.5 shrink-0" />,
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await supportTicketController.getTicketsForUser(userId, statusFilter);
      if (res.success && res.tickets) setTickets(res.tickets as TicketItem[]);
      else setTickets([]);
      if (res.error) setError(res.error);
    } catch {
      setError("Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [userId, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchReplies = useCallback(async (ticketId: number) => {
    const res = await supportTicketController.getReplies(ticketId, userId);
    if (res.success && res.replies) setReplies(res.replies as ReplyItem[]);
    else setReplies([]);
  }, [userId]);

  async function handleOpenTicket() {
    if (!newSubject.trim() || !newBody.trim()) return;
    setSubmitting(true);
    setNewTicketError("");
    setError("");
    try {
      const res = await supportTicketController.createTicket(userId, newSubject.trim(), newBody.trim());
      if (res.success) {
        setOpenDialog(false);
        setNewSubject("");
        setNewBody("");
        setNewTicketError("");
        fetchTickets();
      } else {
        setNewTicketError(res.error ?? "Failed to create ticket");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function openDetail(t: TicketItem) {
    markSeen(t.id, t.updatedAt);
    setTickets((prev) => [...prev]);
    setSelectedTicket(t);
    setReplyBody("");
    setReplies([]);
    void fetchReplies(t.id);
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
      await fetchReplies(selectedTicket.id);
      const now = new Date().toISOString();
      markSeen(selectedTicket.id, now);
      fetchTickets();
    }
  }

  async function handleUpdateStatus(status: TicketStatus) {
    if (!selectedTicket) return;
    setStatusUpdating(true);
    const res = await supportTicketController.updateStatus(selectedTicket.id, status, userId);
    setStatusUpdating(false);
    if (res.success && res.ticket) {
      setSelectedTicket(res.ticket as TicketItem);
      fetchTickets();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support</h1>
          <p className="text-muted-foreground mt-1">
            Create a ticket or follow up on your requests.
          </p>
        </div>
        <Button
          onClick={() => {
            setNewTicketError("");
            setOpenDialog(true);
          }}
          className="bg-primary/90 text-primary-foreground hover:bg-primary h-10 gap-1"
        >
          <Plus className="h-4 w-4" />
          New ticket
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="bg-card-navy/25 border-card-navy/40 border">
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 w-56 px-4 py-2 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 outline-none" title="Sort tickets">
                {ticketSortIcon[ticketSort]}
                {TICKET_OPENED_SORT_LABELS[ticketSort]}
                <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={`whitespace-nowrap cursor-pointer ${ticketSort === "date-desc" ? "bg-accent text-accent-foreground" : ""}`} onSelect={() => setTicketSort("date-desc")}>
                  <ArrowDown10 className="h-3.5 w-3.5 shrink-0" /> Date: New to Old
                </DropdownMenuItem>
                <DropdownMenuItem className={`whitespace-nowrap cursor-pointer ${ticketSort === "date-asc" ? "bg-accent text-accent-foreground" : ""}`} onSelect={() => setTicketSort("date-asc")}>
                  <ArrowUp10 className="h-3.5 w-3.5 shrink-0" /> Date: Old to New
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <ul className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li
                    key={i}
                    className="w-full flex items-center justify-between gap-4 p-4 rounded-lg border border-white/10 shadow-sm shadow-white/5"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded shrink-0" />
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                  </li>
                ))}
              </ul>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tickets in this tab.</div>
            ) : (
              <ul className="space-y-4">
                {sortedTickets.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(t)}
                      className="w-full flex items-center justify-between gap-4 p-4 rounded-lg border border-white/10 text-left shadow-sm shadow-white/5 transition-all hover:bg-gray-800/50 hover:shadow-md hover:shadow-white/10"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate flex items-center gap-2">
                          {t.subject}
                          {hasNewActivity(t.id, t.updatedAt) && (
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{t.body}</p>
                        {isAdmin ? (
                          <>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              Opened by {t.ownerDisplayName ?? "Unknown"} · {formatExactTimestamp(t.createdAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last updated {formatExactTimestamp(t.updatedAt)}
                            </p>
                          </>
                        ) : null}
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
          </div>
        </CardContent>
      </Card>

      {openDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New ticket</h2>
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
              {newTicketError ? (
                <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">
                  {newTicketError}
                </div>
              ) : null}
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

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-border flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{selectedTicket.body}</p>
                {isAdmin ? (
                  <>
                    <p className="text-xs text-muted-foreground mt-2">
                      Owner: {selectedTicket.ownerDisplayName ?? "Unknown"} · Opened{" "}
                      {formatExactTimestamp(selectedTicket.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ticket record last updated {formatExactTimestamp(selectedTicket.updatedAt)}
                    </p>
                  </>
                ) : null}
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedTicket.status === "closed"
                      ? "bg-muted text-muted-foreground"
                      : selectedTicket.status === "processing"
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {selectedTicket.status}
                </span>
              </div>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground shrink-0"
                onClick={() => {
                  setSelectedTicket(null);
                  setReplies([]);
                }}
                title="Close"
                aria-label="Close ticket detail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <p className="text-sm font-semibold text-foreground">Replies</p>
              {replies.length === 0 ? (
                <p className="text-muted-foreground text-sm">No replies yet.</p>
              ) : (
                replies.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-lg border border-border bg-muted/20 text-left flex flex-col gap-3"
                  >
                    <p className="text-sm text-foreground whitespace-pre-wrap">{r.body}</p>
                    <div className="pt-2 border-t border-border/50 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{formatReplyAuthorForViewer(isAdmin, r)}</span>
                      <span className="text-muted-foreground/80" aria-hidden>
                        ·
                      </span>
                      <time dateTime={r.createdAt}>{formatExactTimestamp(r.createdAt)}</time>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedTicket.status !== "closed" && (
              <div className="p-4 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type a reply…"
                  className="flex-1 min-w-0 h-9 px-3 border border-input rounded-md bg-background text-sm"
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
