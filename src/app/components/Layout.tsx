import { Outlet, NavLink, useNavigate } from "react-router";
import {
  Home,
  TrendingUp,
  FileText,
  Settings,
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
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useState } from "react";
import { authController } from "../services";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Expense", href: "/dashboard/expenses", icon: Plus },
  { name: "Inflow", href: "/dashboard/income", icon: TrendingUp },
  { name: "Loans", href: "/dashboard/loans", icon: Building2 },
  { name: "Manage Categories", href: "/dashboard/manage-categories", icon: FolderTree },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
  { name: "FAQ", href: "/dashboard/faq", icon: HelpCircle },
];

const adminOnlyNav = [{ name: "System admin", href: "/systemadmin", icon: Shield }];

export function Layout() {
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const userEmail = sessionStorage.getItem("userEmail") ?? "";
  const userRole = (sessionStorage.getItem("userRole") ?? "Staff").trim();
  const storedName = sessionStorage.getItem("userName");
  const userName = storedName || (userEmail ? userEmail.split("@")[0] : "User");
  const initials = (userName.length >= 2 ? userName.slice(0, 2) : userName.padEnd(2, "?")).toUpperCase();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  async function handleLogout() {
    try {
      await authController.logout();
    } catch {
      /* still clear local session */
    }
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userName");
    navigate("/login", { replace: true });
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
            <>
              <Button
                type="button"
                className="mt-3 w-full justify-start px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all"
                onClick={() => { setProfileOpen(false); navigate("/dashboard/settings"); }}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Button>
              <Button
                type="button"
                className="mt-2 w-full justify-start px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 rounded-xl transition-all"
                onClick={() => setChangePasswordOpen(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                <span>Change Password</span>
              </Button>
            </>
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

            {userRole === "Admin" && (
              <div className="mb-6">
                <p className="text-xs uppercase font-semibold text-emerald-400/90 px-4 mb-3">Administration</p>
                <ul className="space-y-2">
                  {adminOnlyNav.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-600/80 to-emerald-800/80 text-white shadow-lg shadow-emerald-500/20"
                              : "text-emerald-200/90 hover:bg-slate-700/40"
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
            )}

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

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-gray-400 transition-colors"
                onClick={() => {
                  setChangePasswordOpen(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setPasswordSuccess(false);
                }}
                title="Close"
                aria-label="Close change password"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {passwordSuccess && (
              <p className="text-green-400 text-sm mb-4 p-3 bg-green-500/10 rounded-lg">
                Password changed successfully!
              </p>
            )}

            {passwordError && (
              <p className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-lg">
                {passwordError}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-sm font-medium">Current Password</Label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  placeholder="Enter current password"
                  disabled={passwordLoading}
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm font-medium">New Password</Label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  placeholder="Enter new password (min 6 characters)"
                  disabled={passwordLoading}
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm font-medium">Confirm New Password</Label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  placeholder="Confirm new password"
                  disabled={passwordLoading}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold"
                  disabled={passwordLoading}
                  onClick={async () => {
                    setPasswordLoading(true);
                    setPasswordError("");
                    setPasswordSuccess(false);
                    const res = await authController.changePassword(
                      currentPassword,
                      newPassword,
                      confirmPassword
                    );
                    setPasswordLoading(false);
                    if (res.success) {
                      setPasswordSuccess(true);
                      setTimeout(() => {
                        setChangePasswordOpen(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordSuccess(false);
                      }, 2000);
                    } else {
                      setPasswordError(res.error ?? "Failed to change password");
                    }
                  }}
                >
                  {passwordLoading ? "Changing…" : "Change Password"}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-gray-300 hover:text-white hover:bg-slate-700/30 rounded-lg font-semibold"
                  disabled={passwordLoading}
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}