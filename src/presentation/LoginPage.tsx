/**
 * LoginPage — Skeleton login UI (Sprint 2–3).
 *
 * • Email + Password inputs
 * • Calls AuthController.login()
 * • On success navigates to /dashboard
 * • No real auth system, no tokens, no guards
 */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { authController } from "./ServiceInstances";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = authController.login(email, password);

    if (result.success) {
      // Store the role so Dashboard can display it (simple sessionStorage)
      sessionStorage.setItem("userRole", result.role ?? "Staff");
      sessionStorage.setItem("userEmail", email);
      navigate("/dashboard");
    } else {
      setError(result.error ?? "Login failed.");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>
        ClubZen CFMS — Login
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        {error && (
          <p style={{ color: "red", margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            padding: "10px 0",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}
