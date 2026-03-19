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
  Menu,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useState, useEffect } from "react";
import { authController } from "../services";

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "BDT", label: "BDT (৳)" },
];

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Expense", href: "/dashboard/expenses", icon: Plus },
  { name: "Inflow", href: "/dashboard/income", icon: TrendingUp },
  { name: "Add Loan", href: "/dashboard/add-due", icon: Calendar },
  { name: "Loans", href: "/dashboard/loans", icon: Building2 },
  { name: "Manage Categories", href: "/dashboard/manage-categories", icon: FolderTree },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
  { name: "FAQ", href: "/dashboard/faq", icon: HelpCircle },
];

export function Layout() {
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const userEmail = sessionStorage.getItem("userEmail") ?? "user@example.com";
  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const storedName = sessionStorage.getItem("userName");
  const userName = storedName || userEmail.split("@")[0];
  const initials = userName.slice(0, 2).toUpperCase();

  const [profileName, setProfileName] = useState(userName);
  const [profileCurrency, setProfileCurrency] = useState("USD");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (settingsOpen) {
      const uid = sessionStorage.getItem("userId");
      if (!uid) return;
      setProfileLoading(true);
      setProfileError("");
      authController
        .getProfile(uid)
        .then((res) => {
          if (res.success && res.profile) {
            setProfileName(res.profile.fullName ?? userEmail.split("@")[0]);
            setProfileCurrency(res.profile.currency ?? "USD");
          }
        })
        .catch(() => setProfileError("Failed to load profile"))
        .finally(() => setProfileLoading(false));
    }
  }, [settingsOpen, userEmail]);

  function handleLogout() {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 -top-40 -left-40"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 bottom-0 right-0"></div>
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 w-64 bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-md border-r border-slate-700/50 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">ClubZen</h1>
              <p className="text-xs text-gray-400">CFMS</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700/30">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">{userName}</h3>
              <p className="text-xs text-gray-400">{userRole}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <Button
              type="button"
              className="mt-3 w-full justify-start px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </Button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {/* Main Navigation */}
            <div className="mb-6">
              <p className="text-xs uppercase font-semibold text-gray-500 px-4 mb-3">Menu</p>
              <ul className="space-y-2">
                {navigation.filter(item => !["Help", "FAQ"].includes(item.name)).map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      end={item.href === "/dashboard"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-300 hover:bg-slate-700/40"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* US8 Section: Help & FAQ */}
            <div className="mb-6">
              <p className="text-xs uppercase font-semibold text-blue-400 px-4 mb-3">Help & Support</p>
              <ul className="space-y-2">
                {navigation.filter(item => ["Help", "FAQ"].includes(item.name)).map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500/80 to-blue-700/80 text-white shadow-lg shadow-blue-500/20"
                            : "text-blue-300 hover:bg-blue-700/40"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reports Section */}
            <div>
              <p className="text-xs uppercase font-semibold text-gray-500 px-4 mb-3">Analytics</p>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:bg-slate-700/40"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">Reports</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${reportsOpen ? "rotate-90" : ""}`}
                />
              </button>

              {reportsOpen && (
                <ul className="mt-2 ml-4 space-y-1 border-l border-slate-700/50 pl-4">
                  <li>
                    <NavLink
                      to="/dashboard/monthly-reports"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-blue-600/60 text-white"
                            : "text-gray-400 hover:text-gray-300 hover:bg-slate-700/40"
                        }`
                      }
                    >
                      Monthly
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dashboard/daily-reports"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-blue-600/60 text-white"
                            : "text-gray-400 hover:text-gray-300 hover:bg-slate-700/40"
                        }`
                      }
                    >
                      Daily
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Section - Logo & Logout */}
        <div className="p-4 border-t border-slate-700/30 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-slate-700/40 rounded-xl transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Profile / Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Profile &amp; Settings</h2>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-gray-400 transition-colors"
                onClick={() => setSettingsOpen(false)}
                title="Close"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {profileError && (
              <p className="text-red-400 text-sm mb-4">{profileError}</p>
            )}

            {profileLoading ? (
              <p className="text-gray-400">Loading profile…</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-gray-300 text-sm font-medium">Name</Label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm font-medium">Role</Label>
                  <p className="mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-gray-300">
                    {userRole}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300 text-sm font-medium">Email</Label>
                  <p className="mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-gray-300">
                    {userEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300 text-sm font-medium">Currency</Label>
                  <select
                    value={profileCurrency}
                    onChange={(e) => setProfileCurrency(e.target.value)}
                    className="w-full mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                    title="Currency"
                    aria-label="Preferred currency"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold"
                  disabled={profileSaving}
                  onClick={async () => {
                    const uid = sessionStorage.getItem("userId");
                    if (!uid) return;
                    setProfileSaving(true);
                    setProfileError("");
                    const res = await authController.updateProfile(uid, {
                      fullName: profileName.trim() || undefined,
                      currency: profileCurrency,
                    });
                    setProfileSaving(false);
                    if (res.success) {
                      if (profileName.trim()) {
                        sessionStorage.setItem("userName", profileName.trim());
                      }
                      setSettingsOpen(false);
                    } else {
                      setProfileError(res.error ?? "Failed to save");
                    }
                  }}
                >
                  {profileSaving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}