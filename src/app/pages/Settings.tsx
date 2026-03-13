import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Bell, Lock, Globe, User } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { authController } from "../services";

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "BDT", label: "BDT (৳)" },
];

export function Settings() {
  const userId = sessionStorage.getItem("userId") ?? "";
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [profileCurrency, setProfileCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    authController.getProfile(userId).then((res) => {
      if (res.success && res.profile) {
        setProfileName(res.profile.fullName ?? "");
        setProfileEmail(res.profile.email ?? "");
        setProfileRole(res.profile.role ?? "Staff");
        setProfileCurrency(res.profile.currency ?? "USD");
      }
      setLoading(false);
    });
  }, [userId]);

  async function handleSaveProfile() {
    if (!userId) return;
    setSaving(true);
    setMessage(null);
    const res = await authController.updateProfile(userId, {
      fullName: profileName.trim() || undefined,
      currency: profileCurrency,
    });
    setSaving(false);
    if (res.success) {
      if (profileName.trim()) sessionStorage.setItem("userName", profileName.trim());
      setMessage({ type: "success", text: "Settings updated successfully." });
    } else {
      setMessage({ type: "error", text: res.error ?? "Failed to update settings." });
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-2 text-sm ${
            message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <p className="mt-1 px-3 py-2 border border-input rounded-md bg-muted/50 text-muted-foreground">
                {profileEmail}
              </p>
            </div>
            <div>
              <Label>Role</Label>
              <p className="mt-1 px-3 py-2 border border-input rounded-md bg-muted/50 text-muted-foreground">
                {profileRole}
              </p>
            </div>
            <Button className="w-full" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Change Password</Label>
              <Button variant="outline" className="w-full mt-1">
                Update Password
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Two-Factor Authentication</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch defaultChecked />
            </div>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Currency</Label>
              <select
                value={profileCurrency}
                onChange={(e) => setProfileCurrency(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Language</Label>
              <select className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
