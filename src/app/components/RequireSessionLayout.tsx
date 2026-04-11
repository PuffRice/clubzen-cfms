import { Navigate } from "react-router";
import { Layout } from "./Layout";

/**
 * Wraps {@link Layout} so the shell only mounts when a client session exists.
 * Otherwise redirects to login (declarative — avoids stuck “Redirecting…” states).
 */
export function RequireSessionLayout() {
  const uid = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("authToken");
  if (!uid || !token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}
