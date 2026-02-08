import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { AddExpense } from "./pages/AddExpense";
import { AddIncome } from "./pages/AddIncome";
import { MonthlyReports } from "./pages/MonthlyReports";
import { DailyReports } from "./pages/DailyReports";
import { AddDue } from "./pages/AddDue";
import { ManageCategories } from "./pages/ManageCategories";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "settings", Component: Settings },
      { path: "add-expense", Component: AddExpense },
      { path: "add-income", Component: AddIncome },
      { path: "monthly-reports", Component: MonthlyReports },
      { path: "daily-reports", Component: DailyReports },
      { path: "add-due", Component: AddDue },
      { path: "manage-categories", Component: ManageCategories },
    ],
  },
]);