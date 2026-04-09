import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertCircle } from "lucide-react";
import { authController } from "../services";
import { supabase } from "@core/supabase/client";

export function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function handleRecoveryLink() {
      if (!window.location.search.includes("type=recovery")) {
        setError("No password recovery token was found. Please request a new reset email.");
        setReady(true);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (sessionError || !data?.session) {
        setError("Invalid or expired reset link. Please request a new password reset.");
      }

      setReady(true);
    }

    handleRecoveryLink();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await authController.resetPassword(newPassword, confirmPassword);
      if (result.success) {
        setSuccess("Your password has been updated successfully. You can now sign in with your new password.");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(result.error ?? "Failed to reset password.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Set a New Password</h1>
          <p className="mt-3 text-sm text-slate-600">
            Enter your new password below to complete the reset.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-semibold text-slate-700">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !ready}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl transition hover:shadow-lg disabled:opacity-75"
          >
            {isLoading ? "Updating password..." : "Update password"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700">
            Request a new reset email
          </Link>
          <div className="mt-3">
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
