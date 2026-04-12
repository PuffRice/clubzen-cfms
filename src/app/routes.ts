import { createBrowserRouter } from "react-router";
import { RequireSessionLayout } from "./components/RequireSessionLayout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { MonthlyReports } from "./pages/MonthlyReports";
import { DailyReports } from "./pages/DailyReports";
import { ManageCategories } from "./pages/ManageCategories";
import { Login } from "./pages/Login";
import { Expenses } from "./pages/Expenses";
import { Income } from "./pages/Income";
import { Reports } from "./pages/Reports";
import { Events } from "./pages/Events";
import { Support } from "./pages/Support";
import { SystemAdmin } from "./pages/SystemAdmin";
import { Loans } from "./pages/Loans";
import HelpPage from "./pages/HelpPage";
import FAQPage from "./pages/FAQPage";

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

  // ── System admin (same sidebar Layout as dashboard) ───────
  {
    path: "/systemadmin",
    Component: RequireSessionLayout,
    children: [{ index: true, Component: SystemAdmin }],
  },

  // ── Main app (with sidebar Layout) ────────────────────────
  {
    path: "/dashboard",
    Component: RequireSessionLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "settings", Component: Settings },
      { path: "loans", Component: Loans },
      { path: "manage-categories", Component: ManageCategories },
      { path: "monthly-reports", Component: MonthlyReports },
      { path: "daily-reports", Component: DailyReports },
      { path: "expenses", Component: Expenses },
      { path: "income", Component: Income },
      { path: "reports", Component: Reports },
      { path: "events", Component: Events },
      { path: "support", Component: Support },
      { path: "help", Component: HelpPage },
      { path: "faq", Component: FAQPage },
    ],
  },
]);