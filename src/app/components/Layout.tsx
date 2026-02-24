import { Outlet, NavLink, useNavigate } from "react-router";
import {
  Home,
  Receipt,
  TrendingUp,
  FileText,
  Settings,
  CheckCircle,
  HelpCircle,
  Building2,
  Calendar,
  LogOut,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Plus,
  FolderTree,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Update Settings", href: "/settings", icon: Settings },
  // entries changed to open the list pages where the add dialog can be triggered
  { name: "Add Expense", href: "/expenses?add=true", icon: Plus },
  { name: "Add Income", href: "/income?add=true", icon: TrendingUp },
  { name: "Add Due", href: "/add-due", icon: Calendar },
  { name: "Manage Categories", href: "/manage-categories", icon: FolderTree },
];

export function Layout() {
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);

  const userEmail = sessionStorage.getItem("userEmail") ?? "user@example.com";
  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const userName = userEmail.split("@")[0];
  const initials = userName.slice(0, 2).toUpperCase();

  function handleLogout() {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Dark Theme */}
      <aside className="w-64 bg-slate-900 flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{userName}</h3>
              <p className="text-sm text-slate-400">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {/* View Reports with Submenu */}
            <li>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-white hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>View Reports</span>
                </div>
                {reportsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {reportsOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <NavLink
                      to="/monthly-reports"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800"
                        }`
                      }
                    >
                      Monthly Reports
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/daily-reports"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800"
                        }`
                      }
                    >
                      Daily Reports
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-white hover:bg-slate-800"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Application Logo */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">ClubZen CFMS</span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}