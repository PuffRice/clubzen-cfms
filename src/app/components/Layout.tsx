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
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  // entries changed to open the list pages where the add dialog can be triggered
  { name: "Add Expense", href: "/expenses", icon: Plus },
  { name: "Add Income", href: "/income", icon: TrendingUp },
  { name: "Loan", href: "/add-due", icon: Calendar },
  { name: "Manage Categories", href: "/manage-categories", icon: FolderTree },
];

export function Layout() {
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col">
        {/* User Profile + Settings toggle */}
        <div className="p-6 border-b border-sidebar-border">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-3 w-full text-left hover:opacity-90"
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-sidebar-foreground">{userName}</h3>
              <p className="text-sm text-muted-foreground">{userRole}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <Button
              type="button"
              className="mt-4 w-full justify-start px-4 bg-blue-400 text-white hover:bg-sidebar-accent transition-colors"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </Button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {/* View Reports with Submenu */}
            <li>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 text-sidebar-foreground hover:bg-sidebar-accent hover:py-4"
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
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:py-4 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
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
        <div className="p-6 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              ClubZen CFMS
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                onClick={() => setSettingsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Full Name</Label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <input
                      type="email"
                      defaultValue={sessionStorage.getItem("userEmail") ?? "user@example.com"}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <Button className="w-full mt-1">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Transaction Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Monthly Reports</Label>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}