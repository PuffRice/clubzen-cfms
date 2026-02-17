/**
 * DashboardPage — Skeleton dashboard (Sprint 2–3).
 *
 * Displays:
 *   • Total Income
 *   • Total Expense
 *   • Net Profit / Loss
 *
 * Data comes from ReportController → ReportService → TransactionService.
 * Also provides quick forms to add sample income / expense so the
 * numbers are not always zero during a demo.
 */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  reportController,
  transactionController,
} from "./ServiceInstances";
import type { DashboardSummary } from "@core/service";

export function DashboardPage() {
  const navigate = useNavigate();

  // Pull live summary from the service layer
  const [summary, setSummary] = useState<DashboardSummary>(
    reportController.getDashboardSummary(),
  );

  // Quick‑add form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const userEmail = sessionStorage.getItem("userEmail") ?? "unknown";

  function refreshSummary() {
    setSummary(reportController.getDashboardSummary());
  }

  function handleAddIncome(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      transactionController.addIncome(
        Number(amount),
        new Date(),
        category,
        description,
      );
      refreshSummary();
      clearForm();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  }

  function handleAddExpense(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      transactionController.addExpense(
        Number(amount),
        new Date(),
        category,
        description,
      );
      refreshSummary();
      clearForm();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  }

  function clearForm() {
    setAmount("");
    setCategory("");
    setDescription("");
  }

  function handleLogout() {
    sessionStorage.clear();
    navigate("/login");
  }

  /* ── Render ─────────────────────────────────────────────── */

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 20,
    textAlign: "center",
    flex: 1,
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>ClubZen CFMS — Dashboard</h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0" }}>
            Logged in as <strong>{userEmail}</strong> ({userRole})
          </p>
        </div>
        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <div style={{ ...cardStyle, backgroundColor: "#f0fdf4" }}>
          <p style={{ margin: 0, color: "#6b7280" }}>Total Income</p>
          <h2 style={{ margin: "8px 0 0", color: "#16a34a" }}>
            ${summary.totalIncome.toFixed(2)}
          </h2>
        </div>

        <div style={{ ...cardStyle, backgroundColor: "#fef2f2" }}>
          <p style={{ margin: 0, color: "#6b7280" }}>Total Expense</p>
          <h2 style={{ margin: "8px 0 0", color: "#dc2626" }}>
            ${summary.totalExpense.toFixed(2)}
          </h2>
        </div>

        <div style={{ ...cardStyle, backgroundColor: "#eff6ff" }}>
          <p style={{ margin: 0, color: "#6b7280" }}>Net Profit / Loss</p>
          <h2
            style={{
              margin: "8px 0 0",
              color: summary.netProfitLoss >= 0 ? "#16a34a" : "#dc2626",
            }}
          >
            ${summary.netProfitLoss.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Quick‑add form */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Quick Add Transaction</h3>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: 8, flex: 1, minWidth: 100 }}
          />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: 8, flex: 1, minWidth: 100 }}
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: 8, flex: 2, minWidth: 150 }}
          />
        </div>

        {formError && (
          <p style={{ color: "red", margin: "8px 0 0" }}>{formError}</p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={handleAddIncome}
            style={{
              padding: "8px 20px",
              backgroundColor: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            + Income
          </button>
          <button
            onClick={handleAddExpense}
            style={{
              padding: "8px 20px",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            + Expense
          </button>
        </div>
      </div>
    </div>
  );
}
