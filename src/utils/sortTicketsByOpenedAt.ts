/**
 * Sort support tickets by opened time (`createdAt` ISO timestamp), matching Income’s
 * date sort pattern: primary by instant, then stable tie-break on `id`.
 */
export type TicketOpenedSort = "date-desc" | "date-asc";

export function sortTicketsByOpenedAt<T extends { id: number; createdAt: string }>(
  items: readonly T[],
  sortBy: TicketOpenedSort
): T[] {
  const copy = [...items];
  switch (sortBy) {
    case "date-asc":
      return copy.sort((a, b) => {
        const byTime = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (byTime !== 0) return byTime;
        return a.id - b.id;
      });
    case "date-desc":
      return copy.sort((a, b) => {
        const byTime = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (byTime !== 0) return byTime;
        return b.id - a.id;
      });
    default:
      return copy;
  }
}

export const TICKET_OPENED_SORT_LABELS: Record<TicketOpenedSort, string> = {
  "date-desc": "Date: New to Old",
  "date-asc": "Date: Old to New",
};
