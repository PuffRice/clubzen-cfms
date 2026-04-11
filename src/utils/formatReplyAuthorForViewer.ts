/**
 * Reply author line: admins see email; everyone else sees account type (role) only.
 */
export function formatReplyAuthorForViewer(
  viewerIsAdmin: boolean,
  author: {
    authorEmail?: string;
    authorRole?: string;
    authorDisplayName?: string;
  }
): string {
  if (viewerIsAdmin) {
    const e = author.authorEmail?.trim();
    if (e) return e;
    return author.authorDisplayName?.trim() || "Unknown";
  }
  const r = author.authorRole;
  if (r === "Admin") return "Administrator";
  if (r === "Staff") return "Staff";
  if (r === "User") return "User";
  return "User";
}
