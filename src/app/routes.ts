import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { AddExpense } from "./pages/AddExpense";
import { AddIncome } from "./pages/AddIncome";
import { MonthlyReports } from "./pages/MonthlyReports";
import { DailyReports } from "./pages/DailyReports";
import { AddDue } from "./pages/AddDue";
import { ManageCategories } from "./pages/ManageCategories";
import { Login } from "./pages/Login";
import { Expenses } from "./pages/Expenses";
import { Income } from "./pages/Income";
import { Reports } from "./pages/Reports";
import { Approvals } from "./pages/Approvals";
import { Events } from "./pages/Events";
import { Support } from "./pages/Support";
import { BankDetails } from "./pages/BankDetails";

export const router = createBrowserRouter([
  // ── Default to Login ─────────────────────────────────────
  {
    index: true,
    path: "/",
    Component: Login,
  },

  // ── Login (no Layout) ─────────────────────────────────────
  {
    path: "/login",
    Component: Login,
  },

  // ── Main app (with sidebar Layout) ────────────────────────
  {
    path: "/dashboard",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "settings", Component: Settings },
      { path: "add-expense", Component: AddExpense },
      { path: "add-income", Component: AddIncome },
      { path: "add-due", Component: AddDue },
      { path: "manage-categories", Component: ManageCategories },
      { path: "monthly-reports", Component: MonthlyReports },
      { path: "daily-reports", Component: DailyReports },
      { path: "expenses", Component: Expenses },
      { path: "income", Component: Income },
      { path: "reports", Component: Reports },
      { path: "approvals", Component: Approvals },
      { path: "events", Component: Events },
      { path: "support", Component: Support },
      { path: "bank-details", Component: BankDetails },
    ],
  },
]);