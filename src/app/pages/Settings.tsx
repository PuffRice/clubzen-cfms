import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { User, Globe, Pencil, Check, X } from "lucide-react";
import { Label } from "../components/ui/label";
import { settingsController } from "../services";
import { useCurrency } from "../CurrencyContext";

const CURRENCIES = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "BDT", label: "BDT (৳)", symbol: "৳" },
] as const;

type EditingField = "name" | "currency" | null;

export function Settings() {
  const userId = sessionStorage.getItem("userId") ?? "";
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useCurrency();

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [profileCurrency, setProfileCurrency] = useState(globalCurrency);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditingField>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [draftName, setDraftName] = useState("");
  const [draftCurrency, setDraftCurrency] = useState(globalCurrency);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    settingsController.getSettings(userId).then((res) => {
      if (res.success && res.settings) {
        setProfileName(res.settings.fullName ?? "");
        setProfileEmail(res.settings.email ?? "");
        setProfileRole(res.settings.role ?? "Staff");
        const cur = (res.settings.currency ?? "USD") as "USD" | "BDT";
        setProfileCurrency(cur);
        setDraftCurrency(cur);
      }
      setLoading(false);
    });
  }, [userId]);

  function startEdit(field: EditingField) {
    setEditing(field);
    setMessage(null);
    if (field === "name") setDraftName(profileName);
    if (field === "currency") setDraftCurrency(profileCurrency);
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveName() {
    if (!userId) return;
    setSaving(true);
    const res = await settingsController.updateName(userId, draftName.trim());
    setSaving(false);
    if (res.success) {
      setProfileName(draftName.trim());
      if (draftName.trim()) sessionStorage.setItem("userName", draftName.trim());
      setEditing(null);
      setMessage({ type: "success", text: "Name updated." });
    } else {
      setMessage({ type: "error", text: res.error ?? "Failed to update name." });
    }
  }

  async function saveCurrency() {
    if (!userId) return;
    setSaving(true);
    const res = await settingsController.updateCurrency(userId, draftCurrency);
    setSaving(false);
    if (res.success) {
      setProfileCurrency(draftCurrency);
      setGlobalCurrency(draftCurrency as "USD" | "BDT");
      setEditing(null);
      setMessage({ type: "success", text: "Currency updated. All amounts now display in " + draftCurrency + "." });
    } else {
      setMessage({ type: "error", text: res.error ?? "Failed to update currency." });
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-lg">Loading profile…</p>
      </div>
    );
  }

  const currencyLabel = CURRENCIES.find((c) => c.value === profileCurrency)?.label ?? profileCurrency;
  const initials = (profileName || profileEmail.split("@")[0]).slice(0, 2).toUpperCase();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">View and edit your account details</p>
      </div>

      {/* Toast */}
      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar header */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-5 py-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">{profileName || "—"}</h2>
            <p className="text-sm text-muted-foreground">{profileEmail}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
              {profileRole}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Profile fields */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {/* Full Name */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
              {editing === "name" ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                    autoFocus
                  />
                  <Button size="sm" onClick={saveName} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="mt-1 text-foreground">{profileName || "—"}</p>
              )}
            </div>
            {editing !== "name" && (
              <Button size="sm" variant="ghost" onClick={() => startEdit("name")} title="Edit name">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="py-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
            <p className="mt-1 text-foreground">{profileEmail}</p>
          </div>

          {/* Role (read-only) */}
          <div className="py-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
            <p className="mt-1 text-foreground">{profileRole}</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {/* Currency */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Currency</Label>
              {editing === "currency" ? (
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={draftCurrency}
                    onChange={(e) => setDraftCurrency(e.target.value as "USD" | "BDT")}
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500"
                    title="Select currency"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={saveCurrency} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="mt-1 text-foreground">{currencyLabel}</p>
              )}
            </div>
            {editing !== "currency" && (
              <Button size="sm" variant="ghost" onClick={() => startEdit("currency")} title="Edit currency">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
